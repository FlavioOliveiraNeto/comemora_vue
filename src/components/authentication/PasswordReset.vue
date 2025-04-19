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
    </form>
  </div>
</template>

<script>
import notifications from "../../../utils/notifications_helper";

export default {
  data() {
    return {
      resetPasswordToken: "",
      password: "",
      passwordConfirmation: "",
      loading: false,
    };
  },
  created() {
    this.resetPasswordToken = this.$route.query.reset_password_token || "";
    if (!this.resetPasswordToken) {
      notifications.error(
        this.$store,
        "Token de redefinição não encontrado na URL"
      );
    }
  },
  methods: {
    async submitResetPassword() {
      if (this.password !== this.passwordConfirmation) {
        notifications.error(this.$store, "As senhas não coincidem");
        return;
      }

      if (this.password.length < 6) {
        notifications.error(
          this.$store,
          "A senha deve ter no mínimo 6 caracteres"
        );
        return;
      }

      this.loading = true;

      try {
        const response = await this.$api.put("/users/password", {
          user: {
            reset_password_token: this.resetPasswordToken,
            password: this.password,
            password_confirmation: this.passwordConfirmation,
          },
        });

        this.$router.push({ name: "login" });
        notifications.success(this.$store, response.data?.message);
      } catch (error) {
        console.log(error);
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

<style scoped>
/* Reutiliza os estilos do PasswordForgot.vue */
</style>
