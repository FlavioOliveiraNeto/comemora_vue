<template>
  <div class="media-feed">
    <div class="media-buttons">
      <button
        class="media-button photo-button"
        @click="openSourceSelection('photo')"
      >
        <span class="button-icon">📷</span>
        <span class="button-text">Adicionar Foto</span>
      </button>
      <button
        class="media-button video-button"
        @click="openSourceSelection('video')"
      >
        <span class="button-icon">🎥</span>
        <span class="button-text">Adicionar Vídeo</span>
      </button>
    </div>

    <div class="event-media">
      <h2>Feed</h2>
      <div v-if="media && media.length > 0" class="media-grid">
        <div
          v-for="item in media"
          :key="item.id"
          class="media-item"
          @click="showMediaViewer(item)"
        >
          <div class="media-content-wrapper">
            <img
              v-if="item.type === 'photo'"
              :src="item.file_url"
              :alt="`Mídia do evento ${event.title}`"
              class="media-image"
            />
            <video
              v-else-if="item.type === 'video'"
              class="media-video"
              controls
            >
              <source
                :src="item.file_url"
                :type="item.mimeType || 'video/mp4'"
              />
              Seu navegador não suporta vídeos.
            </video>
            <div class="media-overlay">
              <button
                v-if="
                  (currentUser &&
                    Number(currentUser.id) === Number(item.user_id)) ||
                  (currentUser &&
                    Number(currentUser.id) === Number(event.admin_id))
                "
                class="media-delete"
                @click.stop="openDeleteConfirmation(item.id)"
              >
                <span>×</span>
              </button>
              <div class="media-info">
                <span v-if="item.type === 'video'" class="video-indicator"
                  >🎬</span
                >
                <span class="media-date">{{ formatDate(item.createdAt) }}</span>
              </div>
            </div>
          </div>
          <div class="media-details">
            <p class="media-user-name">Enviado por: {{ item.user_name }}</p>
            <p v-if="item.description" class="media-description">
              {{ item.description }}
            </p>
          </div>
        </div>
      </div>
      <div v-else class="empty-state">
        <div class="empty-icon">📱</div>
        <p>Nenhuma mídia adicionada ainda</p>
        <p class="empty-subtitle">
          Adicione fotos ou vídeos usando os botões acima
        </p>
      </div>
    </div>

    <div v-if="showSourceSelectionModal" class="capture-modal">
      <div class="capture-container">
        <div class="capture-header">
          <h3>Escolha a fonte da mídia</h3>
          <button class="close-button" @click="closeSourceSelectionModal">
            ×
          </button>
        </div>
        <div class="source-selection-options">
          <button @click="selectCamera" class="selection-button camera-option">
            <span class="button-icon">📸</span> Usar Câmera
          </button>
          <button @click="selectUpload" class="selection-button upload-option">
            <span class="button-icon">📁</span> Fazer Upload
          </button>
        </div>
      </div>
    </div>

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

    <input
      type="file"
      ref="fileInputPhoto"
      accept="image/*"
      @change="handleFileUpload"
      style="display: none"
    />
    <input
      type="file"
      ref="fileInputVideo"
      accept="video/*"
      @change="handleFileUpload"
      style="display: none"
    />

    <div v-if="showPreviewModal" class="capture-modal">
      <div class="capture-container">
        <div class="capture-header">
          <h3>Pré-visualização da Mídia</h3>
          <button class="close-button" @click="closePreviewModal">×</button>
        </div>
        <div class="preview-content">
          <img
            v-if="previewMediaType === 'photo' && previewMediaUrl"
            :src="previewMediaUrl"
            alt="Pré-visualização da Foto"
            class="preview-media-item"
          />
          <video
            v-else-if="previewMediaType === 'video' && previewMediaUrl"
            :src="previewMediaUrl"
            controls
            autoplay
            class="preview-media-item"
          >
            Seu navegador não suporta vídeos.
          </video>
          <div class="media-description-input">
            <textarea
              v-model="mediaDescription"
              placeholder="Adicione uma legenda (opcional)"
              rows="3"
            ></textarea>
          </div>
          <div class="preview-actions">
            <button class="action-button add-button" @click="addMediaToFeed">
              Adicionar
            </button>
            <button class="action-button repeat-button" @click="retakeMedia">
              Repetir
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showConfirmDeleteModal" class="capture-modal">
      <div class="capture-container small-modal">
        <div class="capture-header">
          <h3>Confirmar Exclusão</h3>
          <button class="close-button" @click="cancelDeleteMedia">×</button>
        </div>
        <div class="modal-body">
          <p>Tem certeza que deseja excluir esta mídia?</p>
          <div class="preview-actions">
            <button
              class="action-button delete-confirm-button"
              @click="confirmDeleteMedia"
            >
              Sim
            </button>
            <button
              class="action-button repeat-button"
              @click="cancelDeleteMedia"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showDetailedViewerModal" class="media-viewer-modal">
      <div class="detailed-viewer-content">
        <div class="detailed-viewer-header">
          <button class="close-button" @click="closeDetailedViewerModal">
            ×
          </button>
        </div>
        <div class="detailed-media-wrapper">
          <img
            v-if="detailedMediaItem.type === 'photo'"
            :src="detailedMediaItem.file_url"
            :alt="`Mídia do evento ${eventTitle}`"
            class="detailed-media-item"
          />
          <video
            v-else-if="detailedMediaItem.type === 'video'"
            :src="detailedMediaItem.file_url"
            controls
            autoplay
            class="detailed-media-item"
          >
            Seu navegador não suporta vídeos.
          </video>
        </div>
        <div class="detailed-media-info">
          <p
            class="detailed-media-description"
            v-if="detailedMediaItem.description"
          >
            {{ detailedMediaItem.description }}
          </p>
          <div class="detailed-media-meta">
            <span class="detailed-media-user">
              Por: {{ detailedMediaItem.user_name }}
            </span>
            <span class="detailed-media-date">
              Postado em: {{ formatDate(detailedMediaItem.created_at) }}
            </span>
          </div>
        </div>
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
    event: {
      // Prop 'event' adicionada para acessar event.admin_id
      type: Object,
      required: true,
    },
    currentUser: {
      // Prop 'currentUser' para o usuário logado
      type: Object,
      default: null,
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
      showSourceSelectionModal: false,
      showCaptureModal: false,
      showPreviewModal: false,
      showConfirmDeleteModal: false,
      showDetailedViewerModal: false, // NOVO: Estado para o modal de visualização detalhada
      captureMode: "photo",
      selectedMedia: null, // Mantido para compatibilidade, mas o novo modal de detalhes é preferencial
      mediaStream: null,
      mediaRecorder: null,
      recordedChunks: [],
      isRecording: false,
      mediaDescription: "",
      previewMediaFile: null,
      previewMediaType: "",
      previewMediaUrl: null,
      mediaToDeleteId: null,
      detailedMediaItem: null, // NOVO: Armazena o item de mídia para o visualizador detalhado
    };
  },
  methods: {
    formatDate(timestamp) {
      if (!timestamp) return "";
      const date = new Date(timestamp);
      return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    },
    openSourceSelection(type) {
      this.captureMode = type;
      this.showSourceSelectionModal = true;
    },
    selectCamera() {
      this.showSourceSelectionModal = false;
      this.showCaptureModal = true;
      this.$nextTick(() => {
        this.initCamera();
      });
    },
    selectUpload() {
      this.showSourceSelectionModal = false;
      if (this.captureMode === "photo") {
        this.$refs.fileInputPhoto.click();
      } else {
        this.$refs.fileInputVideo.click();
      }
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
        console.error(
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
        this.previewMediaFile = blob;
        this.previewMediaType = "photo";
        this.previewMediaUrl = URL.createObjectURL(blob);
        this.closeCaptureModal();
        this.showPreviewModal = true;
      }, "image/jpeg");
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

        this.previewMediaFile = blob;
        this.previewMediaType = "video";
        this.previewMediaUrl = URL.createObjectURL(blob);
        this.isRecording = false;
        this.closeCaptureModal();
        this.showPreviewModal = true;
      };

      this.mediaRecorder.start();
    },
    stopRecording() {
      if (this.mediaRecorder && this.isRecording) {
        this.mediaRecorder.stop();
      }
    },
    handleFileUpload(event) {
      const file = event.target.files[0];
      if (file) {
        const fileType = file.type.startsWith("image/") ? "photo" : "video";
        this.previewMediaFile = file;
        this.previewMediaType = fileType;
        this.previewMediaUrl = URL.createObjectURL(file);
        this.closeCaptureModal();
        this.showPreviewModal = true;
      }
      event.target.value = null;
    },
    addMediaToFeed() {
      this.$emit("media-captured", {
        id: Date.now().toString(),
        type: this.previewMediaType,
        file: this.previewMediaFile,
        createdAt: new Date(),
        description: this.mediaDescription,
      });
      this.resetPreviewState();
      this.closePreviewModal();
    },
    retakeMedia() {
      this.resetPreviewState();
      this.closePreviewModal();
      this.openSourceSelection(this.captureMode);
    },
    closeSourceSelectionModal() {
      this.showSourceSelectionModal = false;
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
      this.mediaDescription = "";
    },
    closePreviewModal() {
      this.showPreviewModal = false;
      this.resetPreviewState();
    },
    resetPreviewState() {
      if (this.previewMediaUrl) {
        URL.revokeObjectURL(this.previewMediaUrl);
      }
      this.previewMediaFile = null;
      this.previewMediaType = "";
      this.previewMediaUrl = null;
      this.mediaDescription = "";
    },
    // NOVO: Abre o modal de visualização detalhada
    showMediaViewer(item) {
      this.detailedMediaItem = item;
      this.showDetailedViewerModal = true;
    },
    // NOVO: Fecha o modal de visualização detalhada
    closeDetailedViewerModal() {
      this.showDetailedViewerModal = false;
      this.detailedMediaItem = null;
    },
    // Mantido para compatibilidade, mas o clique no card agora abre o modal detalhado
    closeMediaViewer() {
      this.selectedMedia = null;
    },
    openDeleteConfirmation(mediaId) {
      this.mediaToDeleteId = mediaId;
      this.showConfirmDeleteModal = true;
    },
    confirmDeleteMedia() {
      if (this.mediaToDeleteId) {
        this.$emit("remove-media", this.mediaToDeleteId);
      }
      this.showConfirmDeleteModal = false;
      this.mediaToDeleteId = null;
    },
    cancelDeleteMedia() {
      this.showConfirmDeleteModal = false;
      this.mediaToDeleteId = null;
    },
  },
  beforeUnmount() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
    }
    this.resetPreviewState();
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
  grid-template-columns: repeat(
    auto-fill,
    minmax(280px, 1fr)
  ); /* Aumentado de 240px para 280px */
  gap: 1.5rem;
}

.media-item {
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

.media-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.media-content-wrapper {
  position: relative;
  width: 100%;
  padding-top: 75%;
  overflow: hidden;
}

.media-image,
.media-video {
  position: absolute;
  top: 0;
  left: 0;
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
    rgba(0, 0, 0, 0.5)
  );
  opacity: 0;
  transition: opacity 0.3s ease;
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
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.4rem;
  font-weight: bold;
  color: #333;
  transition: all 0.2s ease;
}

.media-delete:hover {
  background: #ff416c;
  color: white;
  transform: scale(1.1);
}

.media-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: white;
  font-size: 0.9rem;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
}

.video-indicator {
  font-size: 1.35rem;
}

.media-details {
  padding: 1rem;
  text-align: left;
  background-color: #ffffff;
  border-top: 1px solid #f0f0f0;
}

.media-user-name {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.25rem;
  font-size: 0.95rem;
}

.media-description {
  color: #666;
  font-size: 0.85rem;
  line-height: 1.4;
  margin-top: 0.5rem;
  word-wrap: break-word;
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

/* Estilos para os modais (geral) */
.capture-modal,
.media-viewer-modal {
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

.capture-container,
.detailed-viewer-content {
  width: 90%;
  max-width: 600px;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.capture-container.small-modal {
  max-width: 400px;
}

.capture-header,
.detailed-viewer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.capture-header h3,
.detailed-viewer-header h3 {
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
  padding-top: 75%;
}

.capture-preview video {
  position: absolute;
  top: 0;
  left: 0;
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

/* Estilos para as opções de seleção de fonte */
.source-selection-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 2rem;
}

.selection-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: #f9f9f9;
  color: #333;
}

.selection-button:hover {
  border-color: #42b983;
  background-color: #e6ffe6;
  color: #42b983;
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
}

.selection-button .button-icon {
  font-size: 1.5rem;
}

/* Estilos para o campo de descrição no modal de pré-visualização */
.media-description-input {
  padding: 1rem;
  background-color: #f9f9f9;
  border-top: 1px solid #eee;
  text-align: center;
}

.media-description-input textarea {
  width: calc(100% - 40px);
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.9rem;
  resize: vertical;
  min-height: 60px;
  max-height: 150px;
  box-sizing: border-box;
}

.media-description-input textarea::placeholder {
  color: #aaa;
}

/* Estilos para a pré-visualização no modal */
.preview-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
}

.preview-media-item {
  max-width: 100%;
  max-height: 40vh;
  object-fit: contain;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.preview-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  justify-content: center;
  width: 100%;
}

.action-button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;
  max-width: 150px;
}

.add-button {
  background-color: #42b983;
  color: white;
}

.add-button:hover {
  background-color: #36a473;
  box-shadow: 0 4px 10px rgba(66, 185, 131, 0.3);
}

.repeat-button {
  background-color: #f0f2f5;
  color: #333;
  border: 1px solid #ddd;
}

.repeat-button:hover {
  background-color: #e0e2e5;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
}

/* Estilos para o corpo do modal de confirmação */
.modal-body {
  padding: 1.5rem;
  text-align: center;
}

.modal-body p {
  font-size: 1.1rem;
  color: #333;
  margin-bottom: 1.5rem;
}

.delete-confirm-button {
  background-color: #ff416c;
  color: white;
}

.delete-confirm-button:hover {
  background-color: #e0325c;
  box-shadow: 0 4px 10px rgba(255, 65, 108, 0.3);
}

/* Estilos para o Modal de Visualização Detalhada */
.media-viewer-modal {
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

.detailed-viewer-content {
  max-width: 900px;
  max-height: 90vh;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
}

.detailed-viewer-header {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #eee;
  background-color: #f8f8f8;
}

.detailed-media-wrapper {
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background-color: #000;
}

.detailed-media-item {
  max-width: 100%;
  max-height: 65vh;
  object-fit: contain;
  border-radius: 8px;
}

.detailed-media-info {
  padding: 1rem 1.5rem;
  background-color: #ffffff;
  border-top: 1px solid #f0f0f0;
}

.detailed-media-description {
  font-size: 1rem;
  color: #333;
  margin-bottom: 0.75rem;
  line-height: 1.5;
  word-wrap: break-word;
}

.detailed-media-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  color: #777;
  border-top: 1px solid #eee;
  padding-top: 0.75rem;
  margin-top: 0.75rem;
}

.detailed-media-user {
  font-weight: 600;
  color: #2c3e50;
}

.detailed-media-date {
  font-style: italic;
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
    gap: 1rem;
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

  .selection-button {
    font-size: 1rem;
    padding: 0.8rem 1rem;
  }

  .media-details {
    padding: 0.75rem;
  }

  .media-user-name {
    font-size: 0.9rem;
  }

  .media-description {
    font-size: 0.8rem;
  }

  .media-description-input textarea {
    width: calc(100% - 32px);
    padding: 8px;
  }

  .action-button {
    font-size: 0.9rem;
    padding: 0.6rem 1rem;
  }

  .modal-body p {
    font-size: 1rem;
  }

  /* Ajustes para o modal de visualização detalhada em mobile */
  .detailed-viewer-content {
    max-width: 95%;
    max-height: 95vh;
  }

  .detailed-media-item {
    max-height: 55vh;
  }

  .detailed-media-info {
    padding: 1rem;
  }

  .detailed-media-description {
    font-size: 0.9rem;
  }

  .detailed-media-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
    font-size: 0.8rem;
  }
}
</style>
