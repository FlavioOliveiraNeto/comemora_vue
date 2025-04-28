<template>
  <div class="error-message">
    <p>Evento não encontrado</p>
    <button @click="$emit('go-home')" class="btn btn-secondary">
      Voltar para a Home
    </button>
  </div>
</template>

<style scoped>
.error-message {
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.error-message p {
  margin-bottom: 1rem;
  color: #ff4444;
  font-size: 1.2rem;
}

.btn {
  padding: 0.75rem 1.5rem;
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
</style>
