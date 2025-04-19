<template>
  <div>
    <h1>Bem-vindo, {{ user.name }}!</h1>
    <p>Seu email: {{ user.email }}</p>
    <p>Função: {{ user.role }}</p>
    <button @click="handleLogout">Sair</button>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import notifications from "../../utils/notifications_helper";

export default {
  computed: {
    ...mapGetters("auth", ["currentUser", "isAuthenticated"]),
    user() {
      return this.currentUser || { name: "", email: "", role: "" };
    },
  },
  methods: {
    ...mapActions("auth", ["logout"]),
    async handleLogout() {
      try {
        const response = await this.logout();
        this.$router.push("/auth");
        notifications.success(this.$store, response.data?.message);
      } catch (error) {
        console.error("Erro ao fazer logout:", error);
      }
    },
  },
  watch: {
    isAuthenticated(newVal) {
      if (!newVal) {
        this.$router.push("/auth");
      }
    },
  },
};
</script>
