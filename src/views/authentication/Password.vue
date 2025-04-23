<template>
  <div class="password-container">
    <div class="card">
      <router-view />
      <div class="back-to-login">
        <router-link :to="{ name: 'login' }">Voltar para login</router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "PasswordView",
};
</script>

<style scoped>
.password-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.back-to-login {
  margin-top: 1.5rem;
  text-align: center;
}

.back-to-login a {
  color: #42b983;
  text-decoration: none;
}
</style>
