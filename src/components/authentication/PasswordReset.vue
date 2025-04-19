<template>
  <div>
    <h1>Redefinir senha</h1>

    <form @submit.prevent="submitResetPassword">
      <input type="hidden" v-model="resetPasswordToken" />

      <div class="form-group">
        <label>Nova senha</label>
        <input
          v-model="password"
          type="password"
          required
          class="form-control"
          placeholder="Mínimo de 6 caracteres"
        />
      </div>

      <div class="form-group">
        <label>Confirme a nova senha</label>
        <input
          v-model="passwordConfirmation"
          type="password"
          required
          class="form-control"
          placeholder="Digite a senha novamente"
        />
      </div>

      <button type="submit" class="btn btn-primary" :disabled="loading">
        {{ loading ? "Processando..." : "Redefinir senha" }}
      </button>

      <p v-if="error" class="error-message">{{ error }}</p>
      <p v-if="success" class="success-message">
        Senha redefinida com sucesso! Você pode fazer login agora.
      </p>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      resetPasswordToken: "",
      password: "",
      passwordConfirmation: "",
      loading: false,
      error: "",
      success: false,
    };
  },
  created() {
    this.resetPasswordToken = this.$route.query.reset_password_token || "";
    if (!this.resetPasswordToken) {
      this.error = "Token de redefinição não encontrado na URL";
    }
  },
  methods: {
    async submitResetPassword() {
      if (this.password !== this.passwordConfirmation) {
        this.error = "As senhas não coincidem";
        return;
      }

      if (this.password.length < 6) {
        this.error = "A senha deve ter no mínimo 6 caracteres";
        return;
      }

      this.loading = true;
      this.error = "";
      this.success = false;

      try {
        await this.$api.put("/users/password", {
          user: {
            reset_password_token: this.resetPasswordToken,
            password: this.password,
            password_confirmation: this.passwordConfirmation,
          },
        });
        this.success = true;
      } catch (error) {
        this.error = error.response?.data?.error || "Erro ao redefinir senha";
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
/* Reutiliza os estilos do PasswordForgot.vue */
</style>
