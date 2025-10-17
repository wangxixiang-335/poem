<template>
  <router-view />
  <AIChatAssistant />
</template>

<script setup lang="ts">
import AIChatAssistant from '@/components/AIChatAssistant.vue'
</script>

<style>
html, body, #app {
  height: 100%;
  margin: 0;
}
</style>