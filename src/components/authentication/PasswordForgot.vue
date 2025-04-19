<template>
  <div>
    <h1>Esqueceu sua senha?</h1>
    <p>Digite seu email para receber instruções de redefinição</p>

    <form @submit.prevent="submitForgotPassword">
      <div class="form-group">
        <label>Email</label>
        <input
          v-model="email"
          type="email"
          required
          class="form-control"
          placeholder="Seu email cadastrado"
        />
      </div>

      <button type="submit" class="btn btn-primary" :disabled="loading">
        {{ loading ? "Enviando..." : "Enviar instruções" }}
      </button>

      <p v-if="error" class="error-message">{{ error }}</p>
      <p v-if="success" class="success-message">
        Email enviado com sucesso! Verifique sua caixa de entrada.
      </p>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      email: "",
      loading: false,
      error: "",
      success: false,
    };
  },
  methods: {
    async submitForgotPassword() {
      this.loading = true;
      this.error = "";
      this.success = false;

      try {
        await this.$api.post("/users/password", {
          user: { email: this.email },
        });
        this.success = true;
      } catch (error) {
        this.error =
          error.response?.data?.error || "Erro ao enviar email de recuperação";
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.form-group {
  margin-bottom: 1rem;
}

.form-control {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.btn-primary {
  background-color: #42b983;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  width: 100%;
  margin-top: 1rem;
}

.error-message {
  color: #ff4444;
  margin-top: 1rem;
}

.success-message {
  color: #42b983;
  margin-top: 1rem;
}
</style>
