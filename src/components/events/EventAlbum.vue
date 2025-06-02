<template>
  <div class="container">
    <button @click="$router.go(-1)" class="btn btn-secondary">
      Voltar para evento
    </button>

    <div class="flip-book" id="eventAlbum" ref="bookRef">
      <!-- Capa inicial -->
      <div class="page page-cover page-cover-top" data-density="hard">
        <div class="page-content">
          <h2>{{ eventData.title || "Sem título" }}</h2>
          <p class="page-text">
            {{ eventData.description || "Sem descrição." }}
          </p>
        </div>
      </div>

      <!-- Páginas de mídia -->
      <div
        v-for="(media, index) in eventData.media"
        :key="media.id"
        class="page"
      >
        <div class="page-content">
          <div class="image-data">
            <img
              v-if="media.type == 'photo'"
              :src="media.file_url"
              alt=""
              @click.stop="openImageModal(media.file_url)"
              @mousedown.stop
              @pointerdown.stop
              class="clickable"
            />

            <video v-else class="media-video" controls>
              <source
                :src="media.file_url"
                :type="media.mimeType || 'video/mp4'"
              />
              Seu navegador não suporta vídeos.
            </video>

            <div class="page-text">
              {{ media.description || "Sem descrição." }}
            </div>
          </div>

          <div class="page-footer">
            <p>Enviado por: {{ media.user_name }}</p>
            <p>{{ index + 2 }}</p>
          </div>
        </div>
      </div>

      <!-- Capa final -->
      <div class="page page-cover page-cover-bottom" data-density="hard">
        <div class="page-content">
          <h2>FIM</h2>
        </div>
      </div>
    </div>

    <!-- Modal de imagem fullscreen -->
    <div v-if="showImageModal" class="modal-backdrop" @click="closeImageModal">
      <img
        :src="fullscreenImage"
        class="modal-image"
        @click.stop
        alt="Imagem ampliada"
      />
    </div>
  </div>
</template>

<script>
import { onMounted, ref, reactive } from "vue";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import { PageFlip } from "page-flip";

export default {
  name: "Flipbook",
  setup() {
    const store = useStore();
    const route = useRoute();
    const bookRef = ref(null);
    const pageFlipInstance = ref(null);

    const eventData = reactive({
      title: "",
      description: "",
      media: [],
    });

    const fullscreenImage = ref(null);
    const showImageModal = ref(false);

    const openImageModal = (imageUrl) => {
      fullscreenImage.value = imageUrl;
      showImageModal.value = true;
    };

    const closeImageModal = () => {
      showImageModal.value = false;
      fullscreenImage.value = null;
    };

    const loadEventData = async () => {
      const eventId = route.params.id;

      try {
        const event = await store.dispatch("events/fetchEventById", eventId);
        const eventMedia = await store.dispatch(
          "events/fetchEventMedia",
          eventId
        );

        eventData.title = event.title;
        eventData.description = event.description;
        eventData.media = eventMedia;
      } catch (error) {
        console.error("Erro ao carregar dados do evento:", error);
      }
    };

    onMounted(async () => {
      await loadEventData();

      pageFlipInstance.value = new PageFlip(bookRef.value, {
        width: 700,
        height: 760,
        minWidth: 315,
        maxWidth: 1000,
        minHeight: 420,
        maxHeight: 1000,
        maxShadowOpacity: 0.5,
        showCover: true,
        mobileScrollSupport: false,
      });

      pageFlipInstance.value.loadFromHTML(document.querySelectorAll(".page"));
    });

    return {
      bookRef,
      eventData,
      fullscreenImage,
      showImageModal,
      openImageModal,
      closeImageModal,
    };
  },
};
</script>

<style lang="scss">
.container {
  height: 100vh;
  width: 99vw;
  display: grid;
  grid-template-rows: min-content;
  align-items: center;
  justify-items: center;
}

.btn {
  width: fit-content;
  padding: 0.5rem 1rem;
  margin: 1rem 0 0 1rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-secondary {
  background-color: #f5f5f5;
  color: #666;
}
.btn-secondary:hover {
  background-color: #e0e0e0;
}

.flip-book {
  display: none;
}

.page {
  background-color: hsl(35, 55%, 98%);
  color: hsl(35, 35%, 35%);
  border: solid 1px hsl(35, 20%, 70%);
  border-radius: 1rem;
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.page .page-content {
  display: grid;
  align-content: space-between;
  height: 100%;
  justify-items: center;
}
.page .image-data {
  width: 100%;
  gap: 1rem;
  height: fit-content;
  display: grid;
  box-sizing: border-box;
  padding: 1rem;
  justify-items: center;
}
.page img {
  max-width: 623px;
  max-height: 520px;
  width: 85%;
  height: auto;
  object-fit: contain;
}
.page video {
  max-height: 520px;
  width: 100%;
  height: auto;
  object-fit: contain;
}
.page .page-text {
  height: fit-content;
  font-size: 1.2rem;
  text-align: center;
  margin: 0px;
  padding: 0.5rem 1rem 0 1rem;
  box-sizing: border-box;
  border-top: solid 1px hsl(35, 55%, 90%);
}
.page .page-footer {
  width: 90%;
  height: 3rem;
  border-top: solid 1px hsl(35, 55%, 90%);
  font-size: 1rem;
  color: hsl(35, 20%, 50%);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1rem;
  box-sizing: border-box;
}
.page.--left {
  border-right: 0;
  box-shadow: inset -7px 0 30px -7px rgba(0, 0, 0, 0.4);
}
.page.--right {
  border-left: 0;
  box-shadow: inset 7px 0 30px -7px rgba(0, 0, 0, 0.4);
}
.page.hard {
  background-color: hsl(35, 50%, 90%);
  border: solid 1px hsl(35, 20%, 50%);
}
.page.page-cover {
  background-color: hsl(35, 45%, 80%);
  color: hsl(35, 35%, 35%);
  border: solid 1px hsl(35, 20%, 50%);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  min-height: 700px;
}
.page.page-cover .page-content {
  width: 100%;
  height: 100%;
  display: grid;
  align-content: center;
}
.page.page-cover h2 {
  text-align: center;
  font-size: 210%;
  margin-top: 2rem;
  margin-bottom: 1rem;
  width: 100%;
}
.page.page-cover .page-text {
  font-size: 1.2rem;
  text-align: center;
  padding: 1rem 2rem;
  margin-top: 1rem;
  width: 100%;
}
.page.page-cover.page-cover-top {
  box-shadow: inset 0px 0 30px 0px rgba(36, 10, 3, 0.5),
    -2px 0 5px 2px rgba(0, 0, 0, 0.4);
}
.page.page-cover.page-cover-bottom {
  box-shadow: inset 0px 0 30px 0px rgba(36, 10, 3, 0.5),
    10px 0 8px 0px rgba(0, 0, 0, 0.4);
}

/* Modal */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  cursor: zoom-out;
}
.modal-image {
  max-width: 90%;
  max-height: 90%;
  border-radius: 8px;
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.2);
  cursor: auto;
}
.clickable {
  cursor: zoom-in;
}
</style>
