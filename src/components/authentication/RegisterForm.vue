<template>
  <div class="card">
    <h1>Registro</h1>
    <form @submit.prevent="handleRegister">
      <div class="form-group">
        <label>Nome</label>
        <input v-model="name" type="text" required class="form-control" />
      </div>
      <div class="form-group">
        <label>Email</label>
        <input v-model="email" type="email" required class="form-control" />
      </div>
      <div class="form-group">
        <label>Senha</label>
        <input
          v-model="password"
          type="password"
          required
          class="form-control"
        />
      </div>
      <div class="form-group">
        <label>Confirme a Senha</label>
        <input
          v-model="passwordConfirmation"
          type="password"
          required
          class="form-control"
        />
      </div>
      <button type="submit" class="btn btn-primary" :disabled="loading">
        {{ loading ? "Carregando..." : "Registrar" }}
      </button>
      <div class="switch-auth">
        <p>
          Já tem uma conta?
          <router-link
            :to="{
              name: 'login',
              query: { redirect: $route.query.redirect },
            }"
          >
            Cadastre-se
          </router-link>
        </p>
      </div>
    </form>
  </div>
</template>

<script>
import notifications from "../../../utils/notifications_helper";

export default {
  data() {
    return {
      name: "",
      email: "",
      password: "",
      passwordConfirmation: "",
      loading: false,
    };
  },
  methods: {
    async handleRegister() {
      if (this.password !== this.passwordConfirmation) {
        notifications.error(this.$store, "As senhas não coincidem");
        return;
      }

      this.loading = true;

      try {
        const response = await this.$store.dispatch("auth/register", {
          name: this.name,
          email: this.email,
          password: this.password,
          password_confirmation: this.passwordConfirmation,
        });
        this.resetForm();
        this.$router.push({
          name: "login",
          query: {
            redirect: this.$route.query.redirect,
          },
        });
        notifications.success(
          this.$store,
          response.message || "Registro realizado com sucesso!"
        );
      } catch (error) {
        const errorMessage =
          error.response?.data?.error || error.message || "Erro ao registrar";
        notifications.error(this.$store, errorMessage);
      } finally {
        this.loading = false;
      }
    },
    switchToLogin(redirect) {
      const currentRedirect = this.$route.query.redirect;
      this.$emit("switch-to-login", currentRedirect || redirect);
    },
    resetForm() {
      this.name = "";
      this.email = "";
      this.password = "";
      this.passwordConfirmation = "";
    },
  },
};
</script>

<style scoped></style>
