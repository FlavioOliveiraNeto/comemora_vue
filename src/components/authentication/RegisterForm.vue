<template>
  <div class="card">
    <h1>Cadastro</h1>
    <form @submit.prevent="handleRegister">
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
        <label>Confirme a senha</label>
        <input
          v-model="passwordConfirmation"
          type="password"
          required
          class="form-control"
        />
      </div>
      <button type="submit" class="btn btn-primary" :disabled="loading">
        {{ loading ? "Carregando..." : "Cadastrar" }}
      </button>
      <div class="switch-auth">
        <p>
          Já tem uma conta?
          <a href="#" @click.prevent="switchToLogin">Faça login</a>
        </p>
      </div>
    </form>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import notifications from "../../../utils/notifications_helper";

export default {
  data() {
    return {
      email: "",
      password: "",
      passwordConfirmation: "",
      loading: false,
    };
  },
  computed: {
    ...mapGetters("auth", ["isAuthenticated"]),
  },
  methods: {
    async handleRegister() {
      this.loading = true;

      try {
        const response = await this.$store.dispatch("auth/register", {
          email: this.email,
          password: this.password,
          passwordConfirmation: this.passwordConfirmation,
        });

        if (response) {
          notifications.success(this.$store, "Cadastro realizado com sucesso!");

          // Redireciona após o cadastro
          this.$router.push("/home");
        }
      } catch (error) {
        notifications.error(
          this.$store,
          error.message || "Erro ao registrar, tente novamente."
        );
      } finally {
        this.loading = false;
      }
    },
    switchToLogin() {
      this.$emit("switch-to-login");
    },
  },
};
</script>

<style scoped></style>
