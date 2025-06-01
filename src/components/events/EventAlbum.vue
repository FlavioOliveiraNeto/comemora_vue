<template>
  <div class="container">
    <div class="flip-book" id="eventAlbum" ref="bookRef">
      <div class="page page-cover page-cover-top" data-density="hard">
        <div class="page-content">
          <h2>{{ eventData.title || "Sem título" }}</h2>
          <p class="page-text">
            {{ eventData.description || "Sem descrição." }}
          </p>
        </div>
      </div>

      <div
        v-for="(media, index) in eventData.media"
        :key="media.id"
        class="page"
      >
        <div class="page-content">
          <div class="image-data">
            <img :src="media.file_url" alt="" />
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

      <div class="page page-cover page-cover-bottom" data-density="hard">
        <div class="page-content"><h2>FIM</h2></div>
      </div>
    </div>

    <div class="pagination">
      <button type="button" class="btn-prev">Anterior</button>
      [<span class="page-current">1</span> de <span class="page-total">-</span>]
      <button type="button" class="btn-next">Próxima</button>
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
        width: 800,
        height: 850,
        minWidth: 315,
        maxWidth: 1000,
        minHeight: 420,
        maxHeight: 1350,

        maxShadowOpacity: 0.5,
        showCover: true,
        mobileScrollSupport: false,
      });

      pageFlipInstance.value.loadFromHTML(document.querySelectorAll(".page"));

      // Navegação e eventos
      document.querySelector(".page-total").innerText =
        pageFlipInstance.value.getPageCount();

      document.querySelector(".btn-prev").addEventListener("click", () => {
        pageFlipInstance.value.flipPrev();
      });

      document.querySelector(".btn-next").addEventListener("click", () => {
        pageFlipInstance.value.flipNext();
      });

      pageFlipInstance.value.on("flip", (e) => {
        document.querySelector(".page-current").innerText = e.data + 1;
      });
    });

    return {
      bookRef,
      eventData,
    };
  },
};
</script>

<style lang="scss">
.container {
  height: fit-content;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
}

.flip-book {
  display: none;
  background-size: cover;
  height: 100%;
  width: 100%;
  padding-top: 1rem;
}

.pagination {
  display: none;
}

.page {
  background-color: hsl(35, 55%, 98%);
  color: hsl(35, 35%, 35%);
  border: solid 1px hsl(35, 20%, 70%);
  border-radius: 1rem;
  overflow: hidden;

  .page-content {
    width: 100%;
    height: 100%;
    display: grid;
    align-content: space-between;
    align-items: stretch;
    justify-items: center;

    .image-data {
      width: 100%;
      height: 100%;
      display: grid;
      gap: 1rem;
      align-items: stretch;
      justify-items: center;
    }

    img {
      width: 85%;
      height: auto;
      margin-top: 1.5rem;
    }

    .page-text {
      height: fit-content;
      font-size: 1.2rem;
      text-align: center;
      margin: 0px;
      padding: 10px 0 0 0;
      box-sizing: border-box;
      border-top: solid 1px hsl(35, 55%, 90%);
    }

    .page-footer {
      width: 90%;
      height: fit-content;
      border-top: solid 1px hsl(35, 55%, 90%);
      font-size: 1rem;
      color: hsl(35, 20%, 50%);
      display: flex;
      justify-content: space-between;
    }
  }

  &.--left {
    // for left page (property will be added automatically)
    border-right: 0;
    box-shadow: inset -7px 0 30px -7px rgba(0, 0, 0, 0.4);
  }

  &.--right {
    // for right page (property will be added automatically)
    border-left: 0;
    box-shadow: inset 7px 0 30px -7px rgba(0, 0, 0, 0.4);
  }

  &.hard {
    // for hard page
    background-color: hsl(35, 50%, 90%);
    border: solid 1px hsl(35, 20%, 50%);
  }

  &.page-cover {
    background-color: hsl(35, 45%, 80%);
    color: hsl(35, 35%, 35%);
    border: solid 1px hsl(35, 20%, 50%);

    h2 {
      text-align: center;
      padding-top: 50%;
      font-size: 210%;
    }

    .page-content {
      width: 100%;
      height: 100%;
      display: grid;
      align-content: flex-start;
      align-items: stretch;
      justify-items: center;
    }

    &.page-cover-top {
      box-shadow: inset 0px 0 30px 0px rgba(36, 10, 3, 0.5),
        -2px 0 5px 2px rgba(0, 0, 0, 0.4);
    }

    &.page-cover-bottom {
      box-shadow: inset 0px 0 30px 0px rgba(36, 10, 3, 0.5),
        10px 0 8px 0px rgba(0, 0, 0, 0.4);
    }
  }
}
</style>
