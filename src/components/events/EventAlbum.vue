<template>
  <div class="digital-album">
    <div class="album-container">
      <div class="page-container">
        <!-- Página Esquerda -->
        <div
          class="page left-page"
          :class="{ turning: isTurningPage }"
          :style="leftPageStyle"
        >
          <div class="page-shadow"></div>
          <div class="page-inner">
            <div
              v-if="currentIndex >= 0 && currentIndex < items.length"
              class="page-content"
            >
              <div class="photo-frame">
                <img
                  :src="items[currentIndex].file_url"
                  :alt="'Foto ' + (currentIndex + 1)"
                  class="media"
                  @load="onImageLoad"
                />
                <div class="photo-corners">
                  <div class="corner corner-tl"></div>
                  <div class="corner corner-tr"></div>
                  <div class="corner corner-bl"></div>
                  <div class="corner corner-br"></div>
                </div>
              </div>
              <div class="details">
                <p class="description">{{ items[currentIndex].description }}</p>
                <div class="timestamp-container">
                  <div class="timestamp">
                    <i class="icon-calendar"></i>
                    {{ formatDate(items[currentIndex].created_at) }}
                  </div>
                  <div class="posted-by">
                    <i class="icon-user"></i>
                    {{ items[currentIndex].user_name }}
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="empty-page">
              <div class="empty-content">
                <div class="empty-icon"></div>
                <p>Página em branco</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Página Direita -->
        <div
          class="page right-page"
          :class="{ turning: isTurningPage }"
          :style="rightPageStyle"
        >
          <div class="page-shadow"></div>
          <div class="page-inner">
            <div v-if="currentIndex + 1 < items.length" class="page-content">
              <div class="photo-frame">
                <img
                  :src="items[currentIndex + 1].file_url"
                  :alt="'Foto ' + (currentIndex + 2)"
                  class="media"
                  @load="onImageLoad"
                />
                <div class="photo-corners">
                  <div class="corner corner-tl"></div>
                  <div class="corner corner-tr"></div>
                  <div class="corner corner-bl"></div>
                  <div class="corner corner-br"></div>
                </div>
              </div>
              <div class="details">
                <p class="description">
                  {{ items[currentIndex + 1].description }}
                </p>
                <div class="timestamp-container">
                  <div class="timestamp">
                    <i class="icon-calendar"></i>
                    {{ formatDate(items[currentIndex + 1].timestamp) }}
                  </div>
                  <div class="posted-by">
                    <i class="icon-user"></i>
                    {{ items[currentIndex + 1].postedBy }}
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="empty-page">
              <div class="empty-content">
                <div class="empty-icon"></div>
                <p>Página em branco</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Linha central do álbum -->
        <div class="album-spine"></div>
      </div>

      <!-- Contador de páginas -->
      <div class="page-counter">
        <span
          >{{ Math.floor(currentIndex / 2) + 1 }} /
          {{ Math.ceil(items.length / 2) }}</span
        >
      </div>
    </div>

    <!-- Controles melhorados -->
    <div class="controls">
      <button
        @click="previousPage"
        :disabled="currentIndex <= 0"
        class="control-btn prev-btn"
        :class="{ disabled: currentIndex <= 0 }"
      >
        <i class="icon-chevron-left"></i>
        <span>Anterior</span>
      </button>

      <div class="page-indicator">
        <div
          v-for="n in Math.ceil(items.length / 2)"
          :key="n"
          class="indicator-dot"
          :class="{ active: Math.floor(currentIndex / 2) + 1 === n }"
          @click="goToPage(n - 1)"
        ></div>
      </div>

      <button
        @click="nextPage"
        :disabled="currentIndex + 2 >= items.length"
        class="control-btn next-btn"
        :class="{ disabled: currentIndex + 2 >= items.length }"
      >
        <span>Próxima</span>
        <i class="icon-chevron-right"></i>
      </button>
    </div>
  </div>
</template>

<script>
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";

export default {
  name: "EventAlbum",
  data() {
    return {
      items: [],
      currentIndex: 0,
      isTurningPage: false,
      route: useRoute(),
      store: useStore(),
    };
  },
  created() {
    this.getEventMedia();
  },
  computed: {
    leftPageStyle() {
      if (!this.isTurningPage) return {};

      return {
        transform: "rotateY(-25deg) translateZ(20px)",
        boxShadow: "-10px 0 20px rgba(0, 0, 0, 0.3)",
        zIndex: 10,
      };
    },
    rightPageStyle() {
      if (!this.isTurningPage) return {};

      return {
        transform: "rotateY(25deg) translateZ(20px)",
        boxShadow: "10px 0 20px rgba(0, 0, 0, 0.3)",
        zIndex: 10,
      };
    },
  },
  methods: {
    async getEventMedia() {
      try {
        const eventId = this.route.params.id;
        await this.store.dispatch("events/fetchEventMedia", eventId);
        this.items = this.store.getters["events/getEventMedia"](eventId) || [];
      } catch (error) {
        console.error("Erro ao carregar evento:", error);
      }
    },
    nextPage() {
      if (this.currentIndex + 2 < this.items.length && !this.isTurningPage) {
        this.turnPage(() => {
          this.currentIndex += 2;
        });
      }
    },
    previousPage() {
      if (this.currentIndex > 0 && !this.isTurningPage) {
        this.turnPage(() => {
          this.currentIndex -= 2;
        });
      }
    },
    goToPage(pageIndex) {
      const newIndex = pageIndex * 2;
      if (newIndex !== this.currentIndex && !this.isTurningPage) {
        this.turnPage(() => {
          this.currentIndex = newIndex;
        });
      }
    },
    turnPage(callback) {
      this.isTurningPage = true;
      setTimeout(() => {
        callback();
        setTimeout(() => {
          this.isTurningPage = false;
        }, 100);
      }, 400);
    },
    formatDate(timestamp) {
      if (!timestamp) return "";
      try {
        const date = new Date(timestamp);
        return format(date, "dd/MM/yyyy HH:mm", { locale: ptBR });
      } catch (error) {
        console.error("Erro ao formatar a data:", error);
        return "";
      }
    },
    onImageLoad() {
      // Callback para quando a imagem carrega
    },
  },
};
</script>

<style scoped>
/* Fonte personalizada e variáveis CSS */
:root {
  --album-bg: linear-gradient(135deg, #8b5a3c 0%, #a0522d 100%);
  --page-bg: linear-gradient(145deg, #faf8f3 0%, #f4f1eb 100%);
  --text-primary: #2c1810;
  --text-secondary: #6b4e37;
  --accent-color: #d4a574;
  --shadow-light: rgba(0, 0, 0, 0.1);
  --shadow-medium: rgba(0, 0, 0, 0.2);
  --shadow-dark: rgba(0, 0, 0, 0.4);
}

/* Ícones simples usando CSS */
.icon-chevron-left::before {
  content: "‹";
}
.icon-chevron-right::before {
  content: "›";
}
.icon-calendar::before {
  content: "📅";
}
.icon-user::before {
  content: "👤";
}

.digital-album {
  display: grid;
  grid-template-rows: 0.9fr 0.1fr;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f1eb 0%, #e8ddd4 100%);
  font-family: "Georgia", "Times New Roman", serif;
  justify-items: center;
  justify-content: center;
}

.album-container {
  position: relative;
  background: var(--album-bg);
  border-radius: 20px;
  box-shadow: 0 20px 40px var(--shadow-dark);
}

.page-container {
  position: relative;
  width: 1400px;
  height: 100%;
  perspective: 2000px;
  transform-style: preserve-3d;
}

.page {
  position: absolute;
  top: 0;
  width: 50%;
  height: 100%;
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  transform-style: preserve-3d;
  cursor: pointer;
}

.page-inner {
  width: 100%;
  height: 100%;
  background: var(--page-bg);
  border-radius: 8px;
  position: relative;
  overflow: hidden;
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.05);
}

.page-shadow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to right,
    transparent 0%,
    rgba(0, 0, 0, 0.05) 50%,
    transparent 100%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.left-page {
  left: 0;
  transform-origin: right center;
}

.left-page .page-shadow {
  background: linear-gradient(
    to left,
    transparent 0%,
    rgba(0, 0, 0, 0.1) 10%,
    transparent 100%
  );
}

.right-page {
  right: 0;
  transform-origin: left center;
}

.right-page .page-shadow {
  background: linear-gradient(
    to right,
    transparent 0%,
    rgba(0, 0, 0, 0.1) 10%,
    transparent 100%
  );
}

.turning .page-shadow {
  opacity: 1;
}

.album-spine {
  position: absolute;
  top: 5%;
  bottom: 5%;
  left: 50%;
  width: 2px;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    var(--accent-color) 20%,
    var(--accent-color) 80%,
    transparent 100%
  );
  transform: translateX(-50%);
  z-index: 1;
}

.page-content {
  height: 100%;
  display: grid;
  grid-template-rows: 0.8fr 0.2fr;
  position: relative;
}

.photo-frame {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 4px 12px var(--shadow-light);
  padding: 15px;
  max-height: 500px;
}

.media {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 2px;
  transition: transform 0.3s ease;
}

.photo-frame:hover .media {
  transform: scale(1.02);
}

.photo-corners {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.corner {
  position: absolute;
  width: 20px;
  height: 20px;
  border: 2px solid var(--accent-color);
}

.corner-tl {
  top: 8px;
  left: 8px;
  border-right: none;
  border-bottom: none;
}

.corner-tr {
  top: 8px;
  right: 8px;
  border-left: none;
  border-bottom: none;
}

.corner-bl {
  bottom: 8px;
  left: 8px;
  border-right: none;
  border-top: none;
}

.corner-br {
  bottom: 8px;
  right: 8px;
  border-left: none;
  border-top: none;
}

.details {
  background: rgba(255, 255, 255, 0.8);
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid var(--accent-color);
}

.description {
  font-size: 16px;
  line-height: 1.5;
  color: var(--text-primary);
  margin-bottom: 12px;
  font-style: italic;
}

.timestamp-container {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.timestamp,
.posted-by {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-secondary);
}

.timestamp i,
.posted-by i {
  font-size: 14px;
}

.empty-page {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.empty-content {
  text-align: center;
  color: #bbb;
}

.empty-icon {
  width: 60px;
  height: 60px;
  margin: 0 auto 15px;
  background: radial-gradient(circle, #ddd 30%, transparent 30%);
  background-size: 10px 10px;
  border-radius: 4px;
  opacity: 0.5;
}

.page-counter {
  position: absolute;
  bottom: -10px;
  right: 20px;
  background: var(--accent-color);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: bold;
  box-shadow: 0 4px 8px var(--shadow-medium);
}

.controls {
  display: flex;
  align-items: center;
  gap: 30px;
  justify-content: center;
}

.control-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px 25px;
  border: none;
  border-radius: 25px;
  background: linear-gradient(145deg, #fff 0%, #f8f8f8 100%);
  color: var(--text-primary);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 6px 12px var(--shadow-light);
  transform: translateY(0);
}

.control-btn:hover:not(.disabled) {
  background: linear-gradient(145deg, #f8f8f8 0%, #eee 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px var(--shadow-medium);
}

.control-btn:active:not(.disabled) {
  transform: translateY(0);
  box-shadow: 0 4px 8px var(--shadow-light);
}

.control-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f5f5f5;
  color: #999;
}

.control-btn i {
  font-size: 20px;
  font-weight: bold;
}

.page-indicator {
  display: flex;
  gap: 8px;
  align-items: center;
}

.indicator-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #ddd;
  cursor: pointer;
  transition: all 0.3s ease;
  transform: scale(1);
}

.indicator-dot:hover {
  background: var(--accent-color);
  transform: scale(1.2);
}

.indicator-dot.active {
  background: var(--accent-color);
  transform: scale(1.3);
  box-shadow: 0 0 10px rgba(212, 165, 116, 0.5);
}

/* Responsividade */
@media (max-width: 900px) {
  .page-container {
    width: 90vw;
    max-width: 700px;
    height: auto;
    min-height: 500px;
  }

  .album-container {
    padding: 20px;
  }

  .controls {
    flex-wrap: wrap;
    gap: 15px;
  }

  .control-btn {
    padding: 12px 20px;
    font-size: 14px;
  }
}

@media (max-width: 768px) {
  .page-container {
    flex-direction: column;
    height: auto;
    perspective: none;
  }

  .page {
    position: relative;
    width: 100%;
    height: 400px;
    margin-bottom: 20px;
    transform: none !important;
  }

  .album-spine {
    display: none;
  }

  .page-counter {
    position: static;
    margin-top: 15px;
    align-self: center;
  }

  .digital-album {
    padding: 20px 10px;
  }

  .photo-frame {
    padding: 10px;
  }

  .page-content {
    padding: 20px;
  }
}

/* Animações suaves */
@keyframes pageFlip {
  0% {
    transform: rotateY(0deg);
  }
  50% {
    transform: rotateY(-90deg);
  }
  100% {
    transform: rotateY(0deg);
  }
}

.turning {
  animation: none; /* Remove a animação automática, usa o transform do computed */
}

/* Melhorias de acessibilidade */
@media (prefers-reduced-motion: reduce) {
  .page,
  .control-btn,
  .indicator-dot,
  .media {
    transition: none;
  }

  .turning {
    animation: none;
    transform: none !important;
  }
}
</style>
