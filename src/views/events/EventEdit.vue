<template>
  <div class="event-edit-container">
    <template v-if="loadingEvent">
      <div class="loading-spinner">
        <span>Carregando evento...</span>
      </div>
    </template>
    <template v-else-if="event">
      <EventForm
        :event="event"
        :loading="loadingSubmit"
        @form-submit="handleUpdateEvent"
        @cancel="handleCancel"
      />
    </template>
    <template v-else>
      <div class="error-message">
        <p>Evento não encontrado</p>
        <button @click="$router.push('/home')" class="btn btn-secondary">
          Voltar
        </button>
      </div>
    </template>
  </div>
</template>

<script>
import EventForm from "@/components/events/EventForm.vue";
import notifications from "../../../utils/notifications_helper";

export default {
  components: {
    EventForm,
  },
  data() {
    return {
      event: null,
      loadingEvent: true,
      loadingSubmit: false,
    };
  },
  mounted() {
    this.fetchEvent();
  },
  methods: {
    async fetchEvent() {
      try {
        const eventId = this.$route.params.id;
        const response = await this.$store.dispatch(
          "events/fetchEventById",
          eventId
        );
        this.event = response;
      } catch (error) {
        notifications.error(this.$store, "Erro ao carregar evento");
      } finally {
        this.loadingEvent = false;
      }
    },
    async handleUpdateEvent(formData) {
      this.loadingSubmit = true;
      console.log(formData);
      try {
        const response = await this.$store.dispatch("events/updateEvent", {
          id: this.$route.params.id,
          formData: formData,
        });

        notifications.success(this.$store, response.message);
        this.$router.push("/home");
      } catch (error) {
        notifications.error(
          this.$store,
          error.response?.data?.message ||
            error.message ||
            "Falha ao criar evento! Tente novamente."
        );
      } finally {
        this.loadingSubmit = false;
      }
    },
    handleCancel() {
      this.$router.push("/home");
    },
  },
};
</script>

<style scoped>
.event-edit-container {
  padding: 2rem 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

.loading-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #666;
}

.error-message {
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.error-message p {
  margin-bottom: 1rem;
  color: #ff4444;
  font-size: 1.2rem;
}
</style>
