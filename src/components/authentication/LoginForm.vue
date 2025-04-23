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
          <a href="#" @click.prevent="switchToRegister">Cadastre-se</a>
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

        const estaAutenticado = this.isAuthenticated;

        if (estaAutenticado) {
          this.$router.push("/home");
          notifications.success(this.$store, response.data?.message);
        } else {
          notifications.error(this.$store, "Login falhou! Tente novamente.");
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
    switchToRegister() {
      this.$emit("switch-to-register");
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
}

.error-message {
  color: #ff4444;
  margin-top: 1rem;
}

.switch-auth {
  margin-top: 1rem;
  text-align: center;
}

.forgot-password {
  margin-top: 1rem;
  text-align: center;
}

.forgot-password a {
  color: #666;
  text-decoration: none;
  font-size: 0.9rem;
}

.forgot-password a:hover {
  text-decoration: underline;
}
</style>
