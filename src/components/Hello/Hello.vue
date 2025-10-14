<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
  </div>
</template>

<script setup lang="ts">
defineProps<{ msg: string }>()
</script>

<style scoped>
.hello h1 {
  font-size: 22px;
}
</style>