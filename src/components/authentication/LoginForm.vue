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
      <div v-if="showResendConfirmation" class="resend-confirmation">
        <button @click="resendConfirmationEmail" :disabled="resending">
          {{ resending ? "Enviando..." : "Reenviar e-mail de confirmação" }}
        </button>
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
      showResendConfirmation: false,
      resending: false,
    };
  },
  computed: {
    ...mapGetters("auth", ["isAuthenticated"]),
  },
  methods: {
    async handleLogin() {
      this.loading = true;
      this.showResendConfirmation = false;

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

        if (error.message && error.message.includes("confirmar sua conta")) {
          this.showResendConfirmation = true;
        }
      } finally {
        this.loading = false;
      }
    },
    async resendConfirmationEmail() {
      this.resending = true;
      try {
        const response = await this.$store.dispatch(
          "auth/resendConfirmationEmail",
          {
            email: this.email,
          }
        );
        notifications.success(
          this.$store,
          response.data?.message ||
            "E-mail de confirmação reenviado com sucesso. Verifique sua caixa de entrada."
        );
      } catch (error) {
        notifications.error(
          this.$store,
          error.message || "Erro ao reenviar e-mail de confirmação."
        );
      } finally {
        this.resending = false;
      }
    },
    switchToRegister(redirect) {
      const currentRedirect = this.$route.query.redirect;
      this.$emit("switch-to-register", currentRedirect || redirect);
    },
  },
};
</script>

<style scoped>
.resend-confirmation {
  margin-top: 1rem;
  text-align: center;
}

.resend-confirmation button {
  background: none;
  border: none;
  color: #007bff;
  cursor: pointer;
  padding: 0;
  font-size: 0.9rem;
}

.resend-confirmation button:hover {
  text-decoration: underline;
}

.resend-confirmation button:disabled {
  color: #ccc;
  cursor: not-allowed;
  text-decoration: none;
}
</style>
