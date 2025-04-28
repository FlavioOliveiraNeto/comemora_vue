<template>
  <div class="events-column">
    <h2>Eventos que você criou</h2>
    <div v-if="events.length === 0" class="no-events">
      <p>Você ainda não criou nenhum evento.</p>
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
          <div class="event-actions">
            <button
              @click="$emit('view-event', event.id)"
              class="action-btn view"
            >
              Ver
            </button>
            <button
              @click="$emit('edit-event', event.id)"
              class="action-btn edit"
            >
              Editar
            </button>
            <button
              @click="$emit('delete-event', event.id)"
              class="action-btn delete"
            >
              Excluir
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import moment from "moment";

export default {
  props: {
    events: {
      type: Array,
      required: true,
      default: () => [],
    },
  },
  methods: {
    formatDate(dateString) {
      return moment(dateString).format("DD/MM/YYYY HH:mm");
    },
  },
};
</script>

<style scoped>
.events-column {
  flex: 1;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 8px;
}

.events-list {
  display: grid;
  gap: 15px;
}

.event-card {
  display: grid;
  padding: 15px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

img {
  max-width: 40rem;
}

.event-actions {
  margin-top: 1rem;
  display: flex;
  justify-content: space-evenly;
}

button {
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  width: 6rem;
}

.action-btn {
  color: white;
}

.view {
  background: #4285f4;
}

.edit {
  background: #ffbb33;
}

.delete {
  background: #ff4444;
}

.no-events {
  padding: 20px;
  text-align: center;
  color: #666;
}
</style>
