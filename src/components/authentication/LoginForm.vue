<template>
  <div class="card">
    <h1>Login</h1>
    <form @submit.prevent="handleLogin">
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
      <button type="submit" class="btn btn-primary" :disabled="loading">
        {{ loading ? "Carregando..." : "Entrar" }}
      </button>
      <div class="switch-auth">
        <p>
          Não tem uma conta?
          <router-link
            :to="{
              name: 'register',
              query: { redirect: $route.query.redirect },
            }"
          >
            Cadastre-se
          </router-link>
        </p>
      </div>
      <div class="forgot-password">
        <router-link :to="{ name: 'password.forgot' }"
          >Esqueceu sua senha?</router-link
        >
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
      loading: false,
    };
  },
  computed: {
    ...mapGetters("auth", ["isAuthenticated"]),
  },
  methods: {
    async handleLogin() {
      this.loading = true;

      try {
        const response = await this.$store.dispatch("auth/login", {
          email: this.email,
          password: this.password,
        });

        if (this.isAuthenticated) {
          const redirectPath = decodeURIComponent(
            this.$route.query.redirect || ""
          );

          if (redirectPath) {
            const eventId = redirectPath.match(/\/events\/(\d+)\/join/)?.[1];
            const token = redirectPath.split("token=")[1];

            if (eventId && token) {
              await this.$store.dispatch("events/joinEvent", {
                eventId,
                token,
              });
              this.$router.push("/home");
            } else {
              this.$router.push(decodeURIComponent(this.$route.query.redirect));
            }
          } else {
            this.$router.push("/home");
          }

          notifications.success(this.$store, response.data?.message);
        }
      } catch (error) {
        notifications.error(
          this.$store,
          error.message || "Credenciais inválidas"
        );
      } finally {
        this.loading = false;
      }
    },
    switchToRegister(redirect) {
      const currentRedirect = this.$route.query.redirect;
      this.$emit("switch-to-register", currentRedirect || redirect);
    },
  },
};
</script>

<style scoped></style>
