<template>
  <notification />
  <router-view />
</template>

<script>
import Notification from "@/components/Notification";

export default {
  components: {
    Notification,
  },
};
</script>

<style>
@import "../src/assets/stylesheets/application.css";
</style>
