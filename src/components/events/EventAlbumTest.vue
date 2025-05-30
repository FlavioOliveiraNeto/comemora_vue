<template>
  <div class="flipbook-container" ref="flipbookContainer">
    <div id="pageflip" class="pageflip"></div>
  </div>
</template>

<script>
import { PageFlip } from "page-flip";

export default {
  name: "EventAlbum",
  data() {
    return {
      items: [],
      pages: [],
      pageFlip: null,
    };
  },
  async mounted() {
    await this.getEventMedia();

    // Inicializa o Flipbook após carregar as páginas
    this.pageFlip = new PageFlip(
      this.$refs.flipbookContainer.querySelector("#pageflip"),
      {
        width: 600,
        height: 800,
        size: "stretch",
        maxShadowOpacity: 0.5,
        showCover: true,
        mobileScrollSupport: false,
      }
    );

    this.pageFlip.loadFromImages(this.pages);
  },
  methods: {
    async getEventMedia() {
      try {
        const eventId = this.$route.params.id;
        await this.$store.dispatch("events/fetchEventMedia", eventId);
        this.items = this.$store.getters["events/getEventMedia"](eventId) || [];
        this.pages = this.items.map((item) => item.file_url);
      } catch (error) {
        console.error("Erro ao carregar evento:", error);
      }
    },
  },
};
</script>

<style>
.flipbook-container {
  width: 90vw;
  height: 90vh;
  margin: auto;
}
.pageflip {
  width: 100%;
  height: 100%;
  box-shadow: 0 0 20px #000;
}
</style>
