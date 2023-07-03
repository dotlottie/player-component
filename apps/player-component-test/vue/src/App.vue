<script setup lang="ts">
import '@dotlottie/player-component';
import { ref } from 'vue';

const speed = ref('5');
const direction = ref('1');
</script>

<!-- todo: props not being passed? -->
<template>
  <div>
    Vue + Vite 🍒 test
    <dotlottie-player
      src="https://lottie.host/53ececb8-cfb3-4505-ac42-b0214d81d2d7/UBIa29hJUQ.lottie"
      :direction="direction"
      controls
      autoplay
      loop
      playmode="bounce"
      :speed="`${Number(speed)}`"
    />
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
