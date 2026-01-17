<template>
  <router-view />
  <Notification />
</template>

<script setup lang="ts">
import Notification from './components/Notification.vue'
</script>

<style>
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background-color: #f5f7fa;
}
</style>
