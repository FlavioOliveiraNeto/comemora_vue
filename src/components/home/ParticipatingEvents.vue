<template>
  <div class="events-column">
    <h2>Eventos que você participa</h2>
    <div v-if="events.length === 0" class="no-events">
      <p>Você não está participando de nenhum evento.</p>
    </div>
    <div v-else class="events-list">
      <div v-for="event in events" :key="event.id" class="event-card">
        <div class="event-banner">
          <img
            v-if="event.banner_url"
            :src="event.banner_url"
            :alt="event.title"
            class="banner-image"
          />
          <div v-else class="banner-placeholder">
            <i class="fas fa-image"></i>
            <span>Sem banner</span>
          </div>
        </div>
        <div class="event-data">
          <h3>{{ event.title }}</h3>
          <p>{{ formatDate(event.start_date) }}</p>
          <p>{{ event.location }}</p>
          <p>Criado por: {{ event.admin.name }}</p>
          <div class="event-actions">
            <button
              @click="$emit('view-event', event.id)"
              class="action-btn view"
            >
              Ver
            </button>
            <button
              @click="showLeaveConfirmation(event.id)"
              class="action-btn leave"
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    </div>

    <ConfirmationModal
      :is-visible="showLeaveModal"
      title="Confirmar Saída"
      message="Tem certeza que deseja sair deste evento?"
      confirmText="Sair"
      cancelText="Cancelar"
      @confirm="handleLeaveConfirmed"
      @close="closeLeaveModal"
    />
  </div>
</template>

<script>
import moment from "moment";
import ConfirmationModal from "../ConfirmationModal.vue";

export default {
  components: {
    ConfirmationModal,
  },
  props: {
    events: {
      type: Array,
      required: true,
      default: () => [],
    },
  },
  data() {
    return {
      showLeaveModal: false,
      eventIdToLeave: null,
    };
  },
  methods: {
    formatDate(dateString) {
      return moment(dateString).format("DD/MM/YYYY HH:mm");
    },
    showLeaveConfirmation(eventId) {
      this.eventIdToLeave = eventId;
      this.showLeaveModal = true;
    },
    closeLeaveModal() {
      this.eventIdToLeave = null;
      this.showLeaveModal = false;
    },
    handleLeaveConfirmed() {
      this.$emit("leave-event", this.eventIdToLeave);
      this.closeLeaveModal();
    },
  },
};
</script>

<style scoped>
.events-column {
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 8px;
}

.events-column h2 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  text-align: center;
  color: #333;
}

.events-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.event-card {
  padding: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.event-banner {
  margin-bottom: 0.75rem;
  overflow: hidden;
  border-radius: 4px;
  aspect-ratio: 16 / 9; /* Manter a proporção */
  min-height: 100px; /* Adicione uma altura mínima */
}

.banner-image {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover; /* Preencher o container mantendo a proporção */
}

.banner-placeholder {
  background-color: #ddd;
  color: #666;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 150px;
  font-size: 0.9rem;
}

.banner-placeholder i {
  margin-right: 0.25rem;
}

.event-data {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
  text-align: center;
  color: #555;
}

.event-data h3 {
  font-size: 1.2rem;
  margin: 0 0 0.25rem 0;
  color: #333;
}

.event-date,
.event-location,
.event-creator {
  font-size: 0.9rem;
  margin: 0;
}

.event-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 0.5rem;
}

.action-btn {
  padding: 0.6rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.9rem;
  flex-grow: 1;
  transition: opacity 0.2s ease;
}

.action-btn:hover {
  opacity: 0.9;
}

.view {
  background-color: #3b82f6;
  color: white;
}

.edit {
  background-color: #f59e0b;
  color: white;
}

.delete {
  background-color: #dc2626;
  color: white;
}

.leave {
  background-color: #8b5cf6;
  color: white;
}

.no-events {
  padding: 1rem;
  text-align: center;
  color: #717171;
  font-size: 0.9rem;
}

/* Tablet and Desktop Styles */
@media (min-width: 768px) {
  .events-column {
    flex: 1;
    padding: 1.5rem;
  }

  .events-column h2 {
    font-size: 1.75rem;
    text-align: left;
  }

  .events-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
  }

  .event-card {
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }

  .event-banner {
    margin-bottom: 1rem;
    height: 200px; /* Altura fixa para o banner em telas maiores */
  }

  .event-data {
    text-align: left;
  }

  .event-actions {
    flex-wrap: nowrap;
    justify-content: flex-start;
  }

  .action-btn {
    flex-grow: 0;
    width: auto;
    min-width: 80px;
  }
}

/* Desktop Large Styles */
@media (min-width: 1024px) {
  .event-banner {
    height: 250px;
  }
}
</style>
