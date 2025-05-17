<template>
  <div class="event-show-container">
    <div class="flex">
      <button
        type="button"
        @click="handleCancel"
        class="btn btn-secondary btn-voltar"
      >
        Voltar
      </button>
    </div>

    <EventLoading v-if="loading" />

    <EventNotFound v-else-if="!event" @go-home="router.push('/home')" />

    <template v-else>
      <ShareModal
        v-if="showShareModal"
        :event="event"
        :invite-link="inviteLink"
        @close="showShareModal = false"
        ref="shareModalRef"
      />

      <EventHeader
        :event="event"
        :is-admin="isAdmin"
        :is-participant="isParticipant"
        @share="showShareModal = true"
        @edit="handleEdit"
        @delete="handleDelete"
        @leave="handleLeaveEvent"
        context="show"
      />

      <EventDetails
        :event="event"
        :format-date="formatDate"
        :calculate-duration="calculateDuration"
      />

      <EventMedia :media="event.media" :event-title="event.title" />
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
import EventMedia from "../../components/events/EventMedia.vue";
import EventLoading from "../../components/events/EventLoading.vue";
import EventNotFound from "../../components/events/EventNotFound.vue";
import ShareModal from "../../components/ShareModal.vue";

export default {
  components: {
    EventHeader,
    EventDetails,
    EventMedia,
    EventLoading,
    EventNotFound,
    ShareModal,
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

    const isAdmin = computed(
      () => event.value?.admin_id === currentUser.value?.id
    );

    const isParticipant = computed(() =>
      event.value?.participants?.some(
        (participant) => participant.id === currentUser.value?.id
      )
    );

    const inviteLink = computed(() => {
      if (!event.value) return "";
      return `${window.location.origin}/events/${event.value.id}/join?token=${event.value.invite_token}`;
    });

    onMounted(async () => {
      try {
        const eventId = route.params.id;
        const response = await store.dispatch("events/fetchEventById", eventId);
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

    const handleEdit = () => {
      router.push(`/events/${event.value.id}/edit`);
    };

    const handleDelete = async () => {
      if (confirm("Tem certeza que deseja excluir este evento?")) {
        try {
          await store.dispatch("events/deleteEvent", event.value.id);
          notifications.success(store, "Evento excluído com sucesso");
          router.push("/home");
        } catch (error) {
          notifications.error(store, "Erro ao excluir evento");
          console.error("Erro ao excluir evento:", error);
        }
      }
    };

    const handleLeaveEvent = async () => {
      if (confirm("Tem certeza que deseja sair deste evento?")) {
        try {
          await store.dispatch("events/leaveEvent", event.value.id);
          notifications.success(store, "Você saiu do evento com sucesso");
          router.push("/home");
        } catch (error) {
          notifications.error(store, "Erro ao sair do evento");
          console.error("Erro ao sair do evento:", error);
        }
      }
    };

    const handleCancel = () => {
      router.push("/home");
    };

    return {
      event,
      loading,
      isAdmin,
      isParticipant,
      showShareModal,
      inviteLink,
      shareModalRef,
      formatDate,
      calculateDuration,
      handleEdit,
      handleDelete,
      handleLeaveEvent,
      handleCancel,
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
