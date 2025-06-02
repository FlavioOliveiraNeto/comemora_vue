<template>
  <div class="confirm-email-container">
    <h1>Confirmação de E-mail</h1>
    <div v-if="loading">
      <p>Carregando...</p>
    </div>
    <div v-else-if="confirmationSuccess">
      <p>
        Seu e-mail foi confirmado com sucesso! Você pode fechar esta página.
      </p>
    </div>
    <div v-else-if="confirmationError">
      <p>Erro ao confirmar o e-mail: {{ errorMessage }}</p>
    </div>
  </div>
</template>

<script>
import api from "@/services/axiosConfig";

export default {
  data() {
    return {
      loading: true,
      confirmationSuccess: false,
      confirmationError: false,
      errorMessage: "",
      confirmationToken: null,
    };
  },
  mounted() {
    this.confirmationToken = this.$route.query.confirmation_token;
    if (this.confirmationToken) {
      this.confirmEmail();
    } else {
      this.errorMessage = "Token de confirmação ausente.";
      this.confirmationError = true;
      this.loading = false;
    }
  },
  methods: {
    async confirmEmail() {
      try {
        const response = await api.get(
          `/users/confirmation?confirmation_token=${this.confirmationToken}`
        );
        this.confirmationSuccess = true;
        this.loading = false;
      } catch (error) {
        this.confirmationError = true;
        this.loading = false;
        this.errorMessage =
          error.response?.data?.message || error.message || "Erro desconhecido";
      }
    },
  },
};
</script>

<style scoped>
.confirm-email-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  width: 100%;
}
</style>
