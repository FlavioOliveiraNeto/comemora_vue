<template>
  <div class="modal-overlay" v-if="isVisible">
    <div class="modal">
      <header class="modal-header">
        <h3>{{ title }}</h3>
        <button @click="$emit('close')">&times;</button>
      </header>
      <section class="modal-body">
        <p>{{ message }}</p>
      </section>
      <footer class="modal-footer">
        <button @click="$emit('confirm')" class="confirm-btn">
          {{ confirmText }}
        </button>
        <button @click="$emit('close')" class="cancel-btn">
          {{ cancelText }}
        </button>
      </footer>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    isVisible: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: "Confirmação",
    },
    message: {
      type: String,
      required: true,
    },
    confirmText: {
      type: String,
      default: "Confirmar",
    },
    cancelText: {
      type: String,
      default: "Cancelar",
    },
  },
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  width: 80%;
  max-width: 500px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.modal-header button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
}

.modal-body {
  margin-bottom: 20px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.confirm-btn {
  background-color: #4caf50;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.cancel-btn {
  background-color: #f44336;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
