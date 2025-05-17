<template>
  <div class="event-header">
    <div class="banner-container">
      <div class="banner">
        <img :src="event.banner_url" :alt="event.title" class="banner-image" />
      </div>
    </div>
    <div class="description">
      <h1>{{ event.title }}</h1>
      <div v-if="isAdmin" class="event-actions">
        <button @click="$emit('share')" class="btn btn-share">
          <i class="fas fa-share-alt"></i> Gerar Link
        </button>
        <button @click="$emit('edit')" class="btn btn-edit">
          <i class="fas fa-edit"></i> Editar
        </button>
        <button @click="$emit('delete')" class="btn btn-delete">
          <i class="fas fa-trash"></i> Excluir
        </button>
      </div>
      <button
        v-else-if="!isParticipant"
        @click="$emit('join')"
        class="btn btn-join"
      >
        <i class="fas fa-sign-out-alt"></i> Participar do Evento
      </button>
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
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isParticipant: {
      type: Boolean,
      default: false,
    },
    context: {
      type: String,
      required: true,
    },
  },
  emits: ["share", "edit", "delete", "join"],
};
</script>

<style scoped>
.event-header {
  display: grid;
  gap: 2rem;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.banner-container {
  width: 100%;
  overflow: hidden;
  border-radius: 1rem;
}

.banner {
  position: relative;
  width: 100%;
  height: auto;
  overflow: hidden;
}

.banner-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center center;
  transition: transform 0.3s ease;
}

.banner:hover .banner-image {
  transform: scale(1.02);
}

.description {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.event-header h1 {
  margin: 0;
  color: #2c3e50;
}

.event-actions {
  display: flex;
  gap: 1rem;
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

.btn-join {
  background-color: #42b983;
  color: white;
}

.btn-join:hover {
  background-color: #42b983d3;
}

.btn-share {
  background-color: #4285f4;
  color: white;
}

.btn-share:hover {
  background-color: #3367d6;
}

@media (max-width: 1024px) {
  .banner {
    height: 350px;
  }
}

@media (max-width: 768px) {
  .banner {
    height: 300px;
  }

  .description {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .event-actions {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .banner {
    height: 250px;
  }

  .banner-container {
    border-radius: 8px;
  }

  .event-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>
