<template>
  <div class="event-media">
    <h2><i class="fas fa-images"></i> Mídias</h2>
    <div v-if="media && media.length > 0" class="media-grid">
      <div v-for="item in media" :key="item.id" class="media-item">
        <img
          :src="item.url"
          :alt="`Mídia do evento ${eventTitle}`"
          class="media-image"
          @click="showMediaViewer(item)"
        />
      </div>
    </div>
    <p v-else>Nenhuma mídia adicionada ainda.</p>
  </div>
</template>

<script>
export default {
  props: {
    media: {
      type: Array,
      default: () => [],
    },
    eventTitle: {
      type: String,
      required: true,
    },
  },
  methods: {
    showMediaViewer(media) {
      // Implementação futura: mostrar visualizador de mídia em tela cheia
      console.log("Mostrar mídia em visualizador:", media);
    },
  },
};
</script>

<style scoped>
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
  cursor: pointer;
  transition: transform 0.2s ease;
}

.media-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.media-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
}
</style>
