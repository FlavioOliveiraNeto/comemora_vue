<template>
  <div class="event-new-container">
    <EventForm
      ref="eventForm"
      :loading="loading"
      @submit="handleCreateEvent"
      @cancel="handleCancel"
    />
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
      loading: false,
    };
  },
  methods: {
    async handleCreateEvent(eventData) {
      this.loading = true;
      try {
        const response = await this.$store.dispatch(
          "events/createEvent",
          eventData
        );
        notifications.success(this.$store, response.data?.message);
        this.$router.push("/home");
      } catch (error) {
        notifications.error(
          this.$store,
          "Falha ao criar evento! Tente novamente."
        );
      } finally {
        this.loading = false;
      }
    },
    handleCancel() {
      this.$router.push("/home");
    },
  },
};
</script>

<style scoped>
.event-new-container {
  padding: 2rem 1rem;
  max-width: 1200px;
  margin: 0 auto;
}
</style>
