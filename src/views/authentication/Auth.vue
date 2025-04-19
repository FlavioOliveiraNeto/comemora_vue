<template>
  <div class="auth-container">
    <div class="auth-card">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component
            :is="Component"
            @switch-to-register="showRegister"
            @switch-to-login="showLogin"
          />
        </transition>
      </router-view>
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    showRegister() {
      this.$router.push({ name: "register" });
    },
    showLogin() {
      this.$router.push({ name: "login" });
    },
  },
};
</script>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.auth-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
