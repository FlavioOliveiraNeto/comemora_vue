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
    </form>
  </div>
</template>

<script>
import notifications from "../../../utils/notifications_helper";

export default {
  data() {
    return {
      email: "",
      loading: false,
    };
  },
  methods: {
    async submitForgotPassword() {
      this.loading = true;

      try {
        const response = await this.$api.post("/users/password", {
          user: { email: this.email },
        });
        notifications.success(this.$store, response.data?.message);
      } catch (error) {
        const errorMessage =
          error.response.data.message + ": " + error.response.data.errors[0];
        notifications.error(
          this.$store,
          errorMessage ||
            error.response.data?.message ||
            "Erro ao enviar email de recuperação"
        );
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped></style>
