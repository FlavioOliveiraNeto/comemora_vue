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
        <div v-for="item in media" :key="item.id" class="media-item">
          <div class="media-content-wrapper">
            <img
              v-if="item.type === 'photo'"
              :src="item.file_url"
              :alt="`Mídia do evento ${event.title}`"
              class="media-image"
              @click="showMediaViewer(item)"
            />
            <video
              v-else-if="item.type === 'video'"
              class="media-video"
              controls
              @click="showMediaViewer(item)"
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
                  currentUserId === item.user_id ||
                  currentUserId === event.admin_id
                "
                class="media-delete"
                @click.stop="removeMedia(item.id)"
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
            <p class="media-user-name">Por: {{ item.user_name }}</p>
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

    <div v-if="selectedMedia" class="media-viewer">
      <div class="viewer-content">
        <div class="viewer-header">
          <button class="close-button" @click="closeMediaViewer">×</button>
        </div>
        <img
          v-if="selectedMedia.type === 'photo'"
          :src="selectedMedia.file_url"
          :alt="`Mídia do evento ${event.title}`"
          class="viewer-image"
        />
        <video
          v-else-if="selectedMedia.type === 'video'"
          class="viewer-video"
          controls
          autoplay
        >
          <source
            :src="selectedMedia.file_url"
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
    event: {
      type: Object,
      required: true,
    },
    currentUserId: {
      type: Number,
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
      showSourceSelectionModal: false, // Estado para o modal de seleção de fonte (câmera/upload)
      showCaptureModal: false, // Estado para o modal de captura (câmera)
      showPreviewModal: false, // NOVO: Estado para o modal de pré-visualização
      captureMode: "photo", // 'photo' ou 'video'
      selectedMedia: null, // Mídia selecionada para o visualizador (do feed)
      mediaStream: null,
      mediaRecorder: null,
      recordedChunks: [],
      isRecording: false,
      mediaDescription: "", // Legenda/descrição da mídia
      previewMediaFile: null, // NOVO: Arquivo de mídia para pré-visualização
      previewMediaType: "", // NOVO: Tipo da mídia para pré-visualização
      previewMediaUrl: null, // NOVO: URL para pré-visualização
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
    // Abre o modal de seleção de fonte (câmera ou upload)
    openSourceSelection(type) {
      this.captureMode = type;
      this.showSourceSelectionModal = true;
    },
    // Seleciona a opção de câmera
    selectCamera() {
      this.showSourceSelectionModal = false;
      this.showCaptureModal = true;
      this.$nextTick(() => {
        this.initCamera();
      });
    },
    // Seleciona a opção de upload de arquivo
    selectUpload() {
      this.showSourceSelectionModal = false;
      if (this.captureMode === "photo") {
        this.$refs.fileInputPhoto.click();
      } else {
        this.$refs.fileInputVideo.click();
      }
    },
    // Inicializa o acesso à câmera
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
    // Tira uma foto da câmera
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
        this.showPreviewModal = true; // Abre o modal de pré-visualização
      }, "image/jpeg");
    },
    // Inicia a gravação de vídeo
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
        this.showPreviewModal = true; // Abre o modal de pré-visualização
      };

      this.mediaRecorder.start();
    },
    // Para a gravação de vídeo
    stopRecording() {
      if (this.mediaRecorder && this.isRecording) {
        this.mediaRecorder.stop();
      }
    },
    // Lida com o upload de arquivo (foto ou vídeo)
    handleFileUpload(event) {
      const file = event.target.files[0];
      if (file) {
        const fileType = file.type.startsWith("image/") ? "photo" : "video";
        this.previewMediaFile = file;
        this.previewMediaType = fileType;
        this.previewMediaUrl = URL.createObjectURL(file);
        this.closeCaptureModal();
        this.showPreviewModal = true; // Abre o modal de pré-visualização
      }
      // Limpa o input para que o mesmo arquivo possa ser selecionado novamente
      event.target.value = null;
    },
    // NOVO: Adiciona a mídia ao feed (chamado do modal de pré-visualização)
    addMediaToFeed() {
      this.$emit("media-captured", {
        id: Date.now().toString(), // ID temporário, o backend dará o ID real
        type: this.previewMediaType,
        file: this.previewMediaFile,
        createdAt: new Date(), // Data temporária, o backend dará a data real
        description: this.mediaDescription,
      });
      this.resetPreviewState();
      this.closePreviewModal();
    },
    // NOVO: Permite ao usuário repetir a captura/upload (chamado do modal de pré-visualização)
    retakeMedia() {
      this.resetPreviewState();
      this.closePreviewModal();
      this.openSourceSelection(this.captureMode); // Reabre o modal de seleção de fonte
    },
    // Fecha o modal de seleção de fonte
    closeSourceSelectionModal() {
      this.showSourceSelectionModal = false;
    },
    // Fecha o modal de captura da câmera
    closeCaptureModal() {
      if (this.isRecording) {
        this.stopRecording();
      }
      if (this.mediaStream) {
        this.mediaStream.getTracks().forEach((track) => track.stop());
        this.mediaStream = null;
      }
      this.showCaptureModal = false;
      this.mediaDescription = ""; // Limpa a descrição ao fechar o modal de captura
    },
    // NOVO: Fecha o modal de pré-visualização e reseta os estados
    closePreviewModal() {
      this.showPreviewModal = false;
      this.resetPreviewState(); // Garante que tudo seja limpo
    },
    // NOVO: Reseta todos os estados relacionados à pré-visualização
    resetPreviewState() {
      if (this.previewMediaUrl) {
        URL.revokeObjectURL(this.previewMediaUrl); // Libera a URL temporária
      }
      this.previewMediaFile = null;
      this.previewMediaType = "";
      this.previewMediaUrl = null;
      this.mediaDescription = "";
    },
    // Abre o visualizador de mídia para itens já no feed
    showMediaViewer(item) {
      // Usar a URL do backend para mídias já enviadas
      this.selectedMedia = { ...item, url: item.file_url };
    },
    // Fecha o visualizador de mídia
    closeMediaViewer() {
      this.selectedMedia = null;
    },
    // Remove uma mídia do feed
    removeMedia(itemId) {
      this.$emit("remove-media", itemId);
    },
  },
  beforeUnmount() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
    }
    this.resetPreviewState(); // Limpa URLs temporárias ao sair do componente
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
  gap: 1.5rem; /* Aumentado o gap para melhor espaçamento */
}

.media-item {
  background: #ffffff; /* Fundo branco para o cartão */
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease; /* Transição mais suave */
  position: relative;
  display: flex;
  flex-direction: column; /* Para empilhar conteúdo e detalhes */
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08); /* Sombra mais suave */
}

.media-item:hover {
  transform: translateY(-5px); /* Efeito de elevação maior */
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15); /* Sombra mais proeminente no hover */
}

.media-content-wrapper {
  position: relative;
  width: 100%;
  padding-top: 75%; /* Proporção 4:3 (altura/largura * 100) */
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
    rgba(0, 0, 0, 0.5) /* Gradiente mais escuro para melhor contraste */
  );
  opacity: 0;
  transition: opacity 0.3s ease; /* Transição mais suave */
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
  width: 36px; /* Botão maior */
  height: 36px; /* Botão maior */
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9); /* Fundo mais opaco */
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.4rem; /* Ícone maior */
  font-weight: bold;
  color: #333; /* Cor do ícone */
  transition: all 0.2s ease;
}

.media-delete:hover {
  background: #ff416c; /* Cor de hover mais vibrante */
  color: white;
  transform: scale(1.1); /* Pequeno zoom no hover */
}

.media-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: white;
  font-size: 0.9rem; /* Fonte ligeiramente maior */
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5); /* Sombra para legibilidade */
}

.video-indicator {
  font-size: 1.35rem; /* Ícone maior */
}

.media-details {
  padding: 1rem;
  text-align: left;
  background-color: #ffffff;
  border-top: 1px solid #f0f0f0; /* Linha sutil separando a mídia dos detalhes */
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
  word-wrap: break-word; /* Garante quebra de linha para descrições longas */
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

/* Estilos para o modal de captura e seleção */
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
  padding-top: 75%; /* Proporção 4:3 */
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
  text-align: center; /* Centraliza o textarea */
}

.media-description-input textarea {
  width: calc(100% - 40px); /* Ajuste para padding */
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.9rem;
  resize: vertical; /* Permite redimensionar verticalmente */
  min-height: 60px;
  max-height: 150px;
  box-sizing: border-box; /* Inclui padding e borda na largura */
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
  max-height: 40vh; /* Altura máxima para a pré-visualização */
  object-fit: contain; /* Garante que a mídia seja contida sem cortar */
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
  flex: 1; /* Ocupa espaço igual */
  max-width: 150px; /* Limita a largura dos botões */
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
    gap: 1rem; /* Ajuste para telas menores */
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
    padding: 0.75rem; /* Ajuste de padding para telas menores */
  }

  .media-user-name {
    font-size: 0.9rem;
  }

  .media-description {
    font-size: 0.8rem;
  }

  .media-description-input textarea {
    width: calc(100% - 32px); /* Ajuste para padding em mobile */
    padding: 8px;
  }

  .action-button {
    font-size: 0.9rem;
    padding: 0.6rem 1rem;
  }
}
</style>
