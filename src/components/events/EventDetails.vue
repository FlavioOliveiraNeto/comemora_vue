<template>
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
</template>

<script>
export default {
  props: {
    event: {
      type: Object,
      required: true,
    },
    formatDate: {
      type: Function,
      required: true,
    },
    calculateDuration: {
      type: Function,
      required: true,
    },
  },
};
</script>

<style scoped>
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
</style>
