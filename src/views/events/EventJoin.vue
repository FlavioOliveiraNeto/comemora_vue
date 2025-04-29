<template>
  <div class="event-show-container">
    <EventLoading v-if="loading" />

    <EventNotFound v-else-if="!event" @go-home="router.push('/home')" />

    <template v-else>
      <EventHeader
        :event="event"
        :is-admin="isAdmin"
        @join="handleJoinEvent"
        context="join"
      />

      <EventDetails
        :event="event"
        :format-date="formatDate"
        :calculate-duration="calculateDuration"
      />
    </template>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import moment from "moment";
import notifications from "../../../utils/notifications_helper";
import EventHeader from "../../components/events/EventHeader.vue";
import EventDetails from "../../components/events/EventDetails.vue";
import EventLoading from "../../components/events/EventLoading.vue";
import EventNotFound from "../../components/events/EventNotFound.vue";

export default {
  components: {
    EventHeader,
    EventDetails,
    EventLoading,
    EventNotFound,
  },
  data() {
    return {
      event: null,
      loading: true,
    };
  },
  computed: {
    ...mapGetters("auth", ["currentUser"]),

    isAdmin() {
      return this.currentUser
        ? this.event?.admin?.id === this.currentUser?.id
        : false;
    },
  },
  methods: {
    async handleJoinEvent() {
      try {
        if (!this.currentUser) {
          this.$router.push({
            name: "login",
            query: { redirect: this.$route.fullPath },
          });
          return;
        }

        const eventId = this.$route.params.id;
        const token = this.$route.query.token;

        await this.$store.dispatch("events/joinEvent", { eventId, token });
        this.$router.push("/home");
      } catch (error) {
        notifications.error(this.$store, "Erro ao aceitar o convite");
        console.error("Erro ao aceitar o convite:", error);
      }
    },

    formatDate(dateString) {
      return moment(dateString).format("DD/MM/YYYY [às] HH:mm");
    },

    calculateDuration() {
      if (!this.event?.start_date || !this.event?.end_date) return "";

      const start = moment(this.event.start_date);
      const end = moment(this.event.end_date);
      const duration = moment.duration(end.diff(start));

      const days = duration.days();
      const hours = duration.hours();
      const minutes = duration.minutes();

      let result = "";
      if (days > 0) result += `${days} dia(s) `;
      if (hours > 0) result += `${hours} hora(s) `;
      if (minutes > 0 || result === "") result += `${minutes} minuto(s)`;

      return result.trim();
    },
  },
  async mounted() {
    try {
      const eventId = this.$route.params.id;
      const token = this.$route.query.token;

      const response = await this.$store.dispatch(
        "events/fetchEventDetailsById",
        { eventId, token }
      );
      this.event = response;
    } catch (error) {
      notifications.error(this.$store, "Erro ao carregar evento");
      console.error("Erro ao carregar evento:", error);
    } finally {
      this.loading = false;
    }
  },
};
</script>

<style scoped>
.event-show-container {
  max-width: 60%;
  margin: 0 auto;
  padding: 2rem;
}

.flex {
  display: flex;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-secondary {
  background-color: #f5f5f5;
  color: #666;
}

.btn-secondary:hover {
  background-color: #e0e0e0;
}

.btn-voltar {
  background-color: transparent;
  border-radius: 1rem 1rem 0px 0px;
}

.btn-voltar:hover {
  background-color: transparent;
  text-decoration: underline;
}

@media (max-width: 768px) {
  .event-show-container {
    max-width: 90%;
    padding: 1rem;
  }
}
</style>
