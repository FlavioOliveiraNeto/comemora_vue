<template>
  <div class="confirm-container">
    <div class="confirm-card">
      <h1>Confirmação de Conta</h1>
      <div v-if="loading" class="loading-message">
        Verificando confirmação...
      </div>
      <div v-if="success" class="success-message">
        Conta confirmada com sucesso! Você pode fazer login agora.
      </div>
      <div v-if="error" class="error-message">{{ error }}</div>
      <router-link v-if="success" to="/auth" class="btn btn-primary"
        >Ir para login</router-link
      >
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      loading: true,
      success: false,
      error: "",
    };
  },
  created() {
    this.confirmAccount();
  },
  methods: {
    async confirmAccount() {
      const token = this.$route.query.confirmation_token;
      if (!token) {
        this.error = "Token de confirmação não encontrado";
        this.loading = false;
        return;
      }

      try {
        await this.$api.get(`/users/confirmation?confirmation_token=${token}`);
        this.success = true;
        this.error = "";
      } catch (error) {
        this.error = error.response?.data?.error || "Erro ao confirmar conta";
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.confirm-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.confirm-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
  text-align: center;
}

.loading-message {
  margin: 1rem 0;
}

.success-message {
  color: #42b983;
  margin: 1rem 0;
}

.error-message {
  color: #ff4444;
  margin: 1rem 0;
}

.btn-primary {
  background-color: #42b983;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
  margin-top: 1rem;
}
</style>
