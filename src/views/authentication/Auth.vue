<template>
  <div class="auth-container">
    <!-- Painel de imagens -->
    <div class="images-panel">
      <div
        v-for="(image, index) in images"
        :key="index"
        :class="['image-container', image.class]"
      >
        <img :src="image.src" class="image" :alt="`Evento ${index + 1}`" />
      </div>
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
const images = ref([]);

// Classes possíveis para os diferentes tamanhos
const CELL_TYPES = [
  { class: "", width: 1, height: 1 },
  { class: "wide", width: 2, height: 1 },
  { class: "tall", width: 1, height: 2 },
  { class: "big", width: 2, height: 2 },
];

// Configuração do grid
const GRID_COLS = 4;
const GRID_ROWS = 8; // Aproximadamente o número de linhas visíveis

// Embaralha um array
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

onMounted(() => {
  const baseImages = [
    img1,
    img2,
    img3,
    img4,
    img5,
    img6,
    img7,
    img8,
    img9,
    img10,
  ];
  generateGrid(baseImages);
});

const generateGrid = (baseImages) => {
  // Criar uma matriz que representa o grid
  const grid = Array(GRID_ROWS)
    .fill()
    .map(() => Array(GRID_COLS).fill(0));
  const result = [];

  // Vamos rastrear quais imagens já foram usadas
  const availableImages = [...baseImages];
  const usedImagesIndices = new Set();

  // Preencher o grid
  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      // Se esta célula já está preenchida, continue
      if (grid[row][col] === 1) continue;

      // Tipos de células possíveis nesta posição
      const possibleTypes = CELL_TYPES.filter((type) => {
        // Verificar se o tipo cabe nas dimensões do grid
        if (col + type.width > GRID_COLS || row + type.height > GRID_ROWS)
          return false;

        // Verificar se todas as células necessárias estão livres
        for (let r = row; r < row + type.height; r++) {
          for (let c = col; c < col + type.width; c++) {
            if (grid[r][c] === 1) return false;
          }
        }

        return true;
      });

      // Se não há tipos possíveis, use o tipo padrão (1x1)
      const cellType =
        possibleTypes.length === 0
          ? CELL_TYPES[0]
          : possibleTypes[Math.floor(Math.random() * possibleTypes.length)];

      // Marcar células como ocupadas
      for (let r = row; r < row + cellType.height; r++) {
        for (let c = col; c < col + cellType.width; c++) {
          grid[r][c] = 1;
        }
      }

      // Selecionar uma imagem não utilizada quando disponível
      let selectedImageIndex;

      // Se todas as imagens já foram usadas pelo menos uma vez
      if (usedImagesIndices.size === baseImages.length) {
        // Shuffle todas as imagens novamente
        const unusedIndices = shuffleArray([
          ...Array(baseImages.length).keys(),
        ]);
        selectedImageIndex = unusedIndices[0];

        // Resetar o controle de uso
        usedImagesIndices.clear();
      } else {
        // Encontrar uma imagem que ainda não foi usada
        const unusedIndices = Array.from(
          Array(baseImages.length).keys()
        ).filter((i) => !usedImagesIndices.has(i));

        selectedImageIndex =
          unusedIndices[Math.floor(Math.random() * unusedIndices.length)];
      }

      // Marcar esta imagem como usada
      usedImagesIndices.add(selectedImageIndex);

      // Adicionar a imagem ao resultado
      result.push({
        src: baseImages[selectedImageIndex],
        class: cellType.class,
      });
    }
  }

  images.value = result;
};

const showRegister = () => router.push({ name: "register" });
const showLogin = () => router.push({ name: "login" });
</script>

<style scoped>
.auth-container {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  min-height: 100vh;
  width: 100vw;
  overflow: hidden;
  background: white;
}

.images-panel {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: 150px;
  grid-auto-flow: dense;
  height: 100vh;
  overflow: hidden;
  background-color: rgba(0, 0, 0, 0.05);
}

.image-container {
  overflow: hidden;
  position: relative;
  background-color: #f5f5f5;
}

.image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.5s ease;
}

.image-container:hover .image {
  transform: scale(1.05);
}

.image-container.tall {
  grid-row: span 2;
}

.image-container.wide {
  grid-column: span 2;
}

.image-container.big {
  grid-column: span 2;
  grid-row: span 2;
}

.forms-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: white;
  position: relative;
}

.logo-container {
  margin-bottom: 2.5rem;
}

.logo {
  width: 18rem;
  max-width: 90%;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 1024px) {
  .auth-container {
    grid-template-columns: 1fr;
  }

  .images-panel {
    display: none;
  }
}
</style>
