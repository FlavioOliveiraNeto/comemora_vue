<template>
  <transition-group
    name="notification"
    tag="div"
    class="notification-container"
  >
    <div
      v-for="notification in notifications"
      :key="notification.id"
      :class="['notification', `notification--${notification.type}`]"
    >
      <div class="notification__content">
        {{ notification.message }}
      </div>
      <button class="notification__close" @click="close(notification.id)">
        &times;
      </button>
    </div>
  </transition-group>
</template>

<script>
import { mapState, mapActions } from "vuex";

export default {
  computed: {
    ...mapState("notifications", ["notifications"]),
  },
  methods: {
    ...mapActions("notifications", ["removeNotification"]),
    close(id) {
      this.removeNotification(id);
    },
  },
};
</script>

<style scoped>
.notification-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
}

.notification {
  position: relative;
  margin-bottom: 1rem;
  padding: 1rem 2.5rem 1rem 1rem;
  border-radius: 4px;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-width: max-content;
}

.notification--success {
  background-color: #4caf50;
}

.notification--error {
  background-color: #f44336;
}

.notification__close {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: transparent;
  border: none;
  color: white;
  font-size: 1.2rem;
}

.notification__close:hover {
  cursor: pointer;
  background-color: #0000001f;
  border-radius: 5rem;
}

.notification-enter-active,
.notification-leave-active {
  transition: all 0.5s ease;
}
.notification-enter-from,
.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
