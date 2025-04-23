<template>
  <div class="auth-container">
    <!-- Painel de imagens -->
    <div class="images-panel">
      <img
        v-for="(image, index) in images"
        :key="index"
        :src="image.src"
        :class="['image', image.class]"
      />
    </div>

    <!-- Painel de formulários -->
    <div class="forms-panel">
      <div class="logo-container">
        <img src="@/assets/images/logo.png" alt="Logo CoMemora" class="logo" />
      </div>

      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component
            :is="Component"
            @switch-to-register="showRegister"
            @switch-to-login="showLogin"
          />
        </transition>
      </router-view>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

import img1 from "@/assets/images/event1.jpg";
import img2 from "@/assets/images/event2.jpg";
import img3 from "@/assets/images/event3.jpg";
import img4 from "@/assets/images/event4.jpg";
import img5 from "@/assets/images/event5.jpg";
import img6 from "@/assets/images/event6.jpg";
import img7 from "@/assets/images/event7.jpg";
import img8 from "@/assets/images/event8.jpg";
import img9 from "@/assets/images/event9.jpg";
import img10 from "@/assets/images/event10.jpg";

const router = useRouter();

const imageList = [img1, img2, img3, img4, img5, img6, img7, img8, img9, img10];

const images = ref([]);

const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};

const randomClass = () => {
  const classes = ["", "tall", "wide"];
  return classes[Math.floor(Math.random() * classes.length)];
};

onMounted(() => {
  const shuffled = imageList.map((src) => ({
    src,
    class: randomClass(),
  }));
  shuffleArray(shuffled);
  images.value = shuffled;
});

const showRegister = () => router.push({ name: "register" });
const showLogin = () => router.push({ name: "login" });
</script>

<style scoped>
.auth-container {
  display: grid;
  grid-template-columns: 1fr;
  min-height: 100vh;
  width: 100vw;
}

@media (min-width: 768px) {
  .auth-container {
    grid-template-columns: 1fr 1fr;
  }
}

.images-panel {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-auto-rows: 150px;
  gap: 1rem;
  padding: 1rem;
  height: 100vh;
  overflow: hidden;
  object-fit: cover;
}

.image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 0.5rem;
}

.image.tall {
  grid-row: span 2;
}

.image.wide {
  grid-column: span 2;
}

.forms-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 2.5rem 1.5rem;
  background-color: white;
}

.logo-container {
  margin-bottom: 2.5rem;
}

.logo {
  width: 18rem;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
