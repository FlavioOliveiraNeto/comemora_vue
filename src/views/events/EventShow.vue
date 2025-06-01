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
        @create-album="handleCreateAlbumEvent"
        context="show"
      />

      <EventDetails
        :event="event"
        :format-date="formatDate"
        :calculate-duration="calculateDuration"
      />

      <EventMedia
        :media="mediaList"
        :event="event"
        :currentUserId="currentUser.id"
        @media-captured="handleMediaCaptured"
        @remove-media="handleMediaRemoved"
      />

      <ConfirmationModal
        :is-visible="showDeleteConfirmation"
        title="Excluir Evento"
        message="Tem certeza que deseja excluir este evento? Esta ação é irreversível."
        confirm-text="Excluir"
        @confirm="confirmDelete"
        @close="showDeleteConfirmation = false"
      />

      <ConfirmationModal
        :is-visible="showLeaveConfirmation"
        title="Sair do Evento"
        message="Tem certeza que deseja sair deste evento?"
        confirm-text="Sair"
        @confirm="confirmLeaveEvent"
        @close="showLeaveConfirmation = false"
      />

      <ConfirmationModal
        :is-visible="showCreateAlbumConfirmation"
        title="Criar Álbum"
        message="Tem certeza que deseja criar um álbum com as mídias atuais?"
        confirm-text="Criar"
        @confirm="confirmCreateAlbumEvent"
        @close="showCreateAlbumConfirmation = false"
      />

      <button
        v-if="isAdmin && event.status === 'active' && isEventExpired"
        type="button"
        @click="finalizeEvent"
        class="btn btn-primary"
      >
        Finalizar Evento
      </button>
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
import ConfirmationModal from "../../components/ConfirmationModal.vue";

export default {
  components: {
    EventHeader,
    EventDetails,
    EventMedia,
    EventLoading,
    EventNotFound,
    ShareModal,
    ConfirmationModal,
  },
  setup() {
    const store = useStore();
    const route = useRoute();
    const router = useRouter();
    const event = ref(null);
    const loading = ref(true);
    const showShareModal = ref(false);
    const shareModalRef = ref(null);

    // Refs para controlar a visibilidade dos modais de confirmação
    const showDeleteConfirmation = ref(false);
    const showLeaveConfirmation = ref(false);
    const showCreateAlbumConfirmation = ref(false);

    const currentUser = computed(() => store.getters["auth/currentUser"]);

    const mediaList = computed(() => {
      const media = store.getters["events/getEventMedia"](event.value?.id);
      return media || []; // Retorna array vazio se for undefined/null
    });

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

    const isEventExpired = computed(() => {
      if (!event.value?.end_date) return false;
      return moment().isAfter(moment(event.value.end_date));
    });

    onMounted(async () => {
      try {
        const eventId = route.params.id;
        const response = await store.dispatch("events/fetchEventById", eventId);
        event.value = response;
        await store.dispatch("events/fetchEventMedia", eventId);
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

    const handleDelete = () => {
      showDeleteConfirmation.value = true;
    };

    const confirmDelete = async () => {
      showDeleteConfirmation.value = false;
      try {
        await store.dispatch("events/deleteEvent", event.value.id);
        notifications.success(store, "Evento excluído com sucesso");
        router.push("/home");
      } catch (error) {
        notifications.error(store, "Erro ao excluir evento");
        console.error("Erro ao excluir evento:", error);
      }
    };

    const handleLeaveEvent = () => {
      showLeaveConfirmation.value = true;
    };

    const confirmLeaveEvent = async () => {
      showLeaveConfirmation.value = false;
      try {
        await store.dispatch("events/leaveEvent", event.value.id);
        notifications.success(store, "Você saiu do evento com sucesso");
        router.push("/home");
      } catch (error) {
        notifications.error(store, "Erro ao sair do evento");
        console.error("Erro ao sair do evento:", error);
      }
    };

    const handleCreateAlbumEvent = () => {
      if (!event.value) {
        notifications.error(store, "Evento não carregado.");
        return;
      }

      if (mediaList.value.length === 0) {
        notifications.info(store, "Não existem mídias nesse evento.");
        return;
      }

      showCreateAlbumConfirmation.value = true;
    };

    const confirmCreateAlbumEvent = async () => {
      showCreateAlbumConfirmation.value = false;
      router.push({ name: "EventAlbum", params: { id: event.value.id } });
    };

    const handleMediaCaptured = async (mediaData) => {
      try {
        const result = await store.dispatch("events/addEventMedia", {
          eventId: event.value.id,
          mediaFile: mediaData.file,
          description: mediaData.description || "",
        });

        if (result) {
          notifications.success(store, "Mídia adicionada com sucesso");
        }
      } catch (error) {
        notifications.error(store, "Erro ao adicionar mídia");
        console.error("Erro ao adicionar mídia:", error);
      }
    };

    const handleMediaRemoved = async (mediaId) => {
      try {
        await store.dispatch("events/removeEventMedia", {
          eventId: event.value.id,
          mediaId,
        });
        notifications.success(store, "Mídia removida com sucesso");
      } catch (error) {
        notifications.error(store, "Erro ao remover mídia");
        console.error("Erro ao remover mídia:", error);
      }
    };

    const handleCancel = () => {
      router.push("/home");
    };

    // Função para finalizar o evento via backend
    const finalizeEvent = async () => {
      if (!event.value) {
        notifications.error(store, "Evento não carregado.");
        return;
      }

      try {
        const response = await store.dispatch(
          "events/finalizeEvent",
          event.value.id
        );
        if (response.success) {
          notifications.success(store, "Evento finalizado com sucesso.");
          // Atualiza o status do evento localmente
          event.value.status = "finished";
        } else {
          notifications.error(
            store,
            response.error || "Erro ao finalizar o evento."
          );
        }
      } catch (error) {
        notifications.error(
          store,
          "Erro ao comunicar com o servidor para finalizar o evento."
        );
        console.error("Erro ao finalizar evento:", error);
      }
    };

    return {
      event,
      loading,
      currentUser,
      isAdmin,
      isParticipant,
      showShareModal,
      inviteLink,
      shareModalRef,
      formatDate,
      calculateDuration,
      handleEdit,
      handleDelete,
      confirmDelete,
      handleLeaveEvent,
      confirmLeaveEvent,
      handleCreateAlbumEvent,
      confirmCreateAlbumEvent,
      handleCancel,
      router,
      mediaList,
      handleMediaCaptured,
      handleMediaRemoved,
      showDeleteConfirmation,
      showLeaveConfirmation,
      showCreateAlbumConfirmation,
      isEventExpired,
      finalizeEvent,
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

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
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
