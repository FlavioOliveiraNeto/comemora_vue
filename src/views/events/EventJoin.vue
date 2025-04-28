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
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
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
  setup() {
    const store = useStore();
    const route = useRoute();
    const router = useRouter();
    const event = ref(null);
    const loading = ref(true);
    const showShareModal = ref(false);
    const shareModalRef = ref(null);

    const currentUser = computed(() => store.getters["auth/currentUser"]);
    const isAdmin = computed(() => {
      return currentUser.value
        ? event.value?.admin?.id === currentUser.value?.id
        : false;
    });

    const handleJoinEvent = async () => {
      try {
        if (!currentUser.value) {
          // Se o usuário não estiver logado, redireciona para a tela de login
          router.push({ name: "login", query: { redirect: route.fullPath } });
          return;
        }

        const eventId = route.params.id;
        const token = route.query.token;

        // Chama a ação da store para aceitar o convite
        await store.dispatch("events/joinEvent", { eventId, token });

        // Após aceitar, redireciona o usuário para a página principal (home)
        router.push("/home");
      } catch (error) {
        notifications.error(store, "Erro ao aceitar o convite");
        console.error("Erro ao aceitar o convite:", error);
      }
    };

    onMounted(async () => {
      try {
        const eventId = route.params.id;
        const token = route.query.token;

        const response = await store.dispatch("events/fetchEventDetailsById", {
          eventId,
          token,
        });
        event.value = response;
      } catch (error) {
        notifications.error(store, "Erro ao carregar evento");
        console.error("Erro ao carregar evento:", error);
      } finally {
        loading.value = false;
      }
    });

    const formatDate = (dateString) => {
      return moment(dateString).format("DD/MM/YYYY [às] HH:mm");
    };

    const calculateDuration = () => {
      if (!event.value?.start_date || !event.value?.end_date) return "";

      const start = moment(event.value.start_date);
      const end = moment(event.value.end_date);
      const duration = moment.duration(end.diff(start));

      const days = duration.days();
      const hours = duration.hours();
      const minutes = duration.minutes();

      let result = "";
      if (days > 0) result += `${days} dia(s) `;
      if (hours > 0) result += `${hours} hora(s) `;
      if (minutes > 0 || result === "") result += `${minutes} minuto(s)`;

      return result.trim();
    };

    return {
      event,
      loading,
      isAdmin,
      handleJoinEvent,
      formatDate,
      calculateDuration,
      router,
    };
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
