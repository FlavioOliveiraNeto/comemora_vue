<template>
  <div class="events-column">
    <h2>Eventos que você participa</h2>
    <div v-if="events.length === 0" class="no-events">
      <p>Você não está participando de nenhum evento.</p>
    </div>
    <div v-else class="events-list">
      <div v-for="event in events" :key="event.id" class="event-card">
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
            @click="$emit('leave-event', event.id)"
            class="action-btn leave"
          >
            Sair
          </button>
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
  padding: 15px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.event-actions {
  margin-top: 10px;
  display: flex;
  gap: 10px;
}

button {
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.action-btn {
  color: white;
}

.view {
  background: #4285f4;
}

.leave {
  background: #aa66cc;
}

.no-events {
  padding: 20px;
  text-align: center;
  color: #666;
}
</style>
