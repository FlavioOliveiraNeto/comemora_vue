<template>
  <div class="media-feed">
    <div class="media-buttons">
      <button class="media-button photo-button" @click="captureMedia('photo')">
        <span class="button-icon">📷</span>
        <span class="button-text">Tirar Foto</span>
      </button>
      <button class="media-button video-button" @click="captureMedia('video')">
        <span class="button-icon">🎥</span>
        <span class="button-text">Gravar Vídeo</span>
      </button>
    </div>

    <div class="event-media">
      <h2>Feed</h2>
      <div v-if="media && media.length > 0" class="media-grid">
        <div
          v-for="item in media"
          :key="item.id"
          class="media-item"
          :class="{ 'media-item-video': item.type === 'video' }"
        >
          <img
            v-if="item.file_data === 'photo'"
            :src="item.file_url"
            :alt="`Mídia do evento ${eventTitle}`"
            class="media-image"
            @click="showMediaViewer(item)"
          />
          <video
            v-else-if="item.file_data === 'video'"
            class="media-video"
            @click="showMediaViewer(item)"
          >
            <source :src="item.file_url" :type="item.mimeType || 'video/mp4'" />
            Seu navegador não suporta vídeos.
          </video>
          <div class="media-overlay">
            <button class="media-delete" @click.stop="removeMedia(item.id)">
              <span>×</span>
            </button>
            <div class="media-info">
              <span v-if="item.file_data === 'video'" class="video-indicator"
                >🎬</span
              >
              <span class="media-date">{{ formatDate(item.createdAt) }}</span>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="empty-state">
        <div class="empty-icon">📱</div>
        <p>Nenhuma mídia adicionada ainda</p>
        <p class="empty-subtitle">
          Tire fotos ou grave vídeos usando os botões acima
        </p>
      </div>
    </div>

    <!-- Modal para captura de mídia -->
    <div v-if="showCaptureModal" class="capture-modal">
      <div class="capture-container">
        <div class="capture-header">
          <h3>{{ captureMode === "photo" ? "Tirar Foto" : "Gravar Vídeo" }}</h3>
          <button class="close-button" @click="closeCaptureModal">×</button>
        </div>

        <div class="capture-preview">
          <video ref="cameraPreview" autoplay playsinline></video>
          <div class="capture-controls">
            <button
              class="capture-button"
              @click="takePicture"
              v-if="captureMode === 'photo'"
            >
              <span class="capture-icon">📷</span>
            </button>
            <template v-else>
              <button
                class="capture-button"
                v-if="!isRecording"
                @click="startRecording"
              >
                <span class="capture-icon">⏺️</span>
              </button>
              <button
                class="capture-button recording"
                v-else
                @click="stopRecording"
              >
                <span class="capture-icon">⏹️</span>
              </button>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- Visualizador de mídia -->
    <div v-if="selectedMedia" class="media-viewer">
      <div class="viewer-content">
        <div class="viewer-header">
          <button class="close-button" @click="closeMediaViewer">×</button>
        </div>
        <img
          v-if="selectedMedia.type === 'photo'"
          :src="selectedMedia.url"
          :alt="`Mídia do evento ${eventTitle}`"
          class="viewer-image"
        />
        <video
          v-else-if="selectedMedia.type === 'video'"
          class="viewer-video"
          controls
          autoplay
        >
          <source
            :src="selectedMedia.url"
            :type="selectedMedia.mimeType || 'video/mp4'"
          />
          Seu navegador não suporta vídeos.
        </video>
      </div>
    </div>
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
  watch: {
    media: {
      immediate: true,
      handler(newMedia) {
        console.log("Mídias atualizadas:", newMedia);
      },
    },
  },
  data() {
    return {
      showCaptureModal: false,
      captureMode: "photo", // 'photo' ou 'video'
      selectedMedia: null,
      mediaStream: null,
      mediaRecorder: null,
      recordedChunks: [],
      isRecording: false,
    };
  },
  methods: {
    formatDate(timestamp) {
      if (!timestamp) return "";
      const date = new Date(timestamp);
      return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    },
    captureMedia(type) {
      this.captureMode = type;
      this.showCaptureModal = true;
      this.$nextTick(() => {
        this.initCamera();
      });
    },
    async initCamera() {
      try {
        const constraints = {
          video: true,
          audio: this.captureMode === "video",
        };

        this.mediaStream = await navigator.mediaDevices.getUserMedia(
          constraints
        );
        if (this.$refs.cameraPreview) {
          this.$refs.cameraPreview.srcObject = this.mediaStream;
        }
      } catch (error) {
        console.error("Erro ao acessar câmera:", error);
        alert(
          "Não foi possível acessar sua câmera. Verifique as permissões do navegador."
        );
        this.closeCaptureModal();
      }
    },
    takePicture() {
      const canvas = document.createElement("canvas");
      const video = this.$refs.cameraPreview;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const context = canvas.getContext("2d");
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        this.$emit("media-captured", {
          id: Date.now().toString(),
          type: "photo",
          file: blob,
          createdAt: new Date(),
        });
      }, "image/jpeg");

      this.closeCaptureModal();
    },
    startRecording() {
      this.recordedChunks = [];
      this.isRecording = true;

      this.mediaRecorder = new MediaRecorder(this.mediaStream, {
        mimeType: "video/webm;codecs=vp9",
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, {
          type: "video/webm",
        });

        const videoUrl = URL.createObjectURL(blob);

        this.$emit("media-captured", {
          id: Date.now().toString(),
          type: "video",
          file: blob,
          mimeType: "video/webm",
          url: videoUrl,
          createdAt: new Date(),
        });

        this.isRecording = false;
        this.closeCaptureModal();
      };

      this.mediaRecorder.start();
    },
    stopRecording() {
      if (this.mediaRecorder && this.isRecording) {
        this.mediaRecorder.stop();
      }
    },
    closeCaptureModal() {
      if (this.isRecording) {
        this.stopRecording();
      }

      if (this.mediaStream) {
        this.mediaStream.getTracks().forEach((track) => track.stop());
        this.mediaStream = null;
      }

      this.showCaptureModal = false;
    },
    showMediaViewer(item) {
      this.selectedMedia = item;
    },
    closeMediaViewer() {
      this.selectedMedia = null;
    },
    removeMedia(itemId) {
      this.$emit("remove-media", itemId);
    },
  },
  beforeUnmount() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
    }
  },
};
</script>

<style scoped>
.media-feed {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.media-buttons {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  justify-content: center;
}

.media-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  color: white;
}

.photo-button {
  background: linear-gradient(45deg, #4776e6, #8e54e9);
}

.video-button {
  background: linear-gradient(45deg, #ff416c, #ff4b2b);
}

.media-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.button-icon {
  font-size: 1.25rem;
}

.event-media {
  margin-top: 2rem;
}

.event-media h2 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  text-align: center;
}

.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1rem;
}

.media-item {
  background: #f5f5f5;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s ease;
  position: relative;
  aspect-ratio: 4/3;
}

.media-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.media-image,
.media-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.media-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.1),
    rgba(0, 0, 0, 0.4)
  );
  opacity: 0;
  transition: opacity 0.2s ease;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 0.75rem;
}

.media-item:hover .media-overlay {
  opacity: 1;
}

.media-delete {
  align-self: flex-end;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.8);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.25rem;
  font-weight: bold;
  transition: all 0.2s ease;
}

.media-delete:hover {
  background: rgba(255, 0, 0, 0.8);
  color: white;
}

.media-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: white;
  font-size: 0.85rem;
}

.video-indicator {
  font-size: 1.25rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  background: #f9f9f9;
  border-radius: 12px;
  text-align: center;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #ccc;
}

.empty-state p {
  color: #666;
  margin: 0.5rem 0;
}

.empty-subtitle {
  font-size: 0.85rem;
  color: #999;
}

/* Estilos para o modal de captura */
.capture-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.capture-container {
  width: 90%;
  max-width: 600px;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.capture-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.capture-header h3 {
  margin: 0;
  font-weight: 600;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
}

.capture-preview {
  position: relative;
  width: 100%;
  aspect-ratio: 4/3;
}

.capture-preview video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.capture-controls {
  position: absolute;
  bottom: 1.5rem;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
}

.capture-button {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: 4px solid white;
  background: rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.capture-button:hover {
  transform: scale(1.05);
}

.capture-button.recording {
  background: rgba(255, 0, 0, 0.6);
  animation: pulse 1.5s infinite;
}

.capture-icon {
  font-size: 1.75rem;
}

/* Estilos para o visualizador de mídia */
.media-viewer {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.viewer-content {
  position: relative;
  width: 90%;
  max-width: 1000px;
  max-height: 90vh;
}

.viewer-header {
  position: absolute;
  top: -40px;
  right: 0;
}

.viewer-image,
.viewer-video {
  max-width: 100%;
  max-height: 80vh;
  display: block;
  margin: 0 auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 0, 0, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(255, 0, 0, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 0, 0, 0);
  }
}

@media (max-width: 768px) {
  .media-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  }

  .capture-button {
    width: 56px;
    height: 56px;
  }

  .button-text {
    display: none;
  }

  .media-button {
    padding: 1rem;
  }

  .button-icon {
    font-size: 1.5rem;
  }
}
</style>
