<template>
  <div class="event-show-container">
    <template v-if="loading">
      <div class="loading-spinner">
        <span>Carregando evento...</span>
      </div>
    </template>
    <template v-else-if="event">
      <div class="event-header">
        <h1>{{ event.title }}</h1>
        <div v-if="isAdmin" class="event-actions">
          <button @click="handleEdit" class="btn btn-edit">
            <i class="fas fa-edit"></i> Editar
          </button>
          <button @click="handleDelete" class="btn btn-delete">
            <i class="fas fa-trash"></i> Excluir
          </button>
        </div>
        <button v-else @click="handleLeaveEvent" class="btn btn-leave">
          <i class="fas fa-sign-out-alt"></i> Sair do Evento
        </button>
      </div>

      <div class="event-details">
        <div class="detail-card">
          <h3><i class="fas fa-info-circle"></i> Detalhes</h3>
          <p>
            <strong>Descrição:</strong>
            {{ event.description || "Nenhuma descrição fornecida" }}
          </p>
          <p><strong>Localização:</strong> {{ event.location }}</p>
        </div>

        <div class="detail-card">
          <h3><i class="fas fa-calendar-alt"></i> Datas</h3>
          <p><strong>Início:</strong> {{ formatDate(event.start_date) }}</p>
          <p><strong>Término:</strong> {{ formatDate(event.end_date) }}</p>
          <p><strong>Duração:</strong> {{ calculateDuration() }}</p>
        </div>

        <div class="detail-card">
          <h3><i class="fas fa-users"></i> Participantes</h3>
          <div
            v-if="event.participants && event.participants.length > 0"
            class="participants-list"
          >
            <div
              v-for="participant in event.participants"
              :key="participant.id"
              class="participant"
            >
              <span>{{ participant.name }}</span>
              <span class="participant-email">{{ participant.email }}</span>
            </div>
          </div>
          <p v-else>Nenhum participante ainda.</p>
        </div>
      </div>

      <div class="event-media">
        <h2><i class="fas fa-images"></i> Mídias</h2>
        <div v-if="event.media && event.media.length > 0" class="media-grid">
          <div v-for="media in event.media" :key="media.id" class="media-item">
            <img
              :src="media.url"
              :alt="`Mídia do evento ${event.title}`"
              class="media-image"
            />
          </div>
        </div>
        <p v-else>Nenhuma mídia adicionada ainda.</p>
      </div>
    </template>
    <template v-else>
      <div class="error-message">
        <p>Evento não encontrado</p>
        <button @click="router.push('/home')" class="btn btn-secondary">
          Voltar para a Home
        </button>
      </div>
    </template>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import moment from "moment";
import notifications from "../../../utils/notifications_helper";

export default {
  setup() {
    const store = useStore();
    const route = useRoute();
    const router = useRouter();
    const event = ref(null);
    const loading = ref(true);

    const currentUser = computed(() => store.getters["auth/currentUser"]);
    const isAdmin = computed(
      () => event.value?.admin?.id === currentUser.value?.id
    );

    onMounted(async () => {
      try {
        const eventId = route.params.id;
        const response = await store.dispatch("events/fetchEventById", eventId);
        event.value = response;
      } catch (error) {
        notifications.error(store, "Erro ao carregar evento");
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

      const hours = duration.hours();
      const minutes = duration.minutes();

      let result = "";
      if (duration.days() > 0) result += `${duration.days()} dia(s) `;
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
        }
      }
    };

    return {
      event,
      loading,
      isAdmin,
      formatDate,
      calculateDuration,
      handleEdit,
      handleDelete,
      handleLeaveEvent,
      router,
    };
  },
};
</script>

<style scoped>
.event-show-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
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

.event-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.event-header h1 {
  margin: 0;
  color: #2c3e50;
}

.event-actions {
  display: flex;
  gap: 1rem;
}

.event-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.detail-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.detail-card h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #42b983;
}

.detail-card p {
  margin: 0.5rem 0;
}

.participants-list {
  margin-top: 1rem;
}

.participant {
  padding: 0.5rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.participant-email {
  display: block;
  font-size: 0.8rem;
  color: #666;
}

.event-media {
  margin-top: 2rem;
}

.event-media h2 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
}

.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.media-item {
  background: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
}

.media-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-edit {
  background-color: #ffbb33;
  color: white;
}

.btn-edit:hover {
  background-color: #ffaa00;
}

.btn-delete {
  background-color: #ff4444;
  color: white;
}

.btn-delete:hover {
  background-color: #cc0000;
}

.btn-leave {
  background-color: #aa66cc;
  color: white;
}

.btn-leave:hover {
  background-color: #9933cc;
}

.btn-secondary {
  background-color: #f5f5f5;
  color: #666;
}

.btn-secondary:hover {
  background-color: #e0e0e0;
}

@media (max-width: 768px) {
  .event-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .event-actions {
    width: 100%;
    flex-direction: column;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
