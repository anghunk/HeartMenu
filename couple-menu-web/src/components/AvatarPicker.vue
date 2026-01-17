<template>
  <div class="relative inline-block text-left" ref="containerRef">
    <div class="flex flex-col">
      <button
        type="button"
        @click="isOpen = !isOpen"
        class="flex items-center space-x-3 p-2 border border-secondary/30 rounded-md bg-white hover:bg-background transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
      >
        <div class="w-10 h-10 rounded-[5px] bg-background overflow-hidden border border-secondary/10 shadow-inner">
          <img :src="getAvatarUrl(modelValue)" class="w-full h-full object-cover" alt="Selected Avatar" />
        </div>
        <div class="flex flex-col items-start">
          <span class="text-xs text-muted">当前头像</span>
          <span class="text-sm font-medium text-text">头像 #{{ modelValue }}</span>
        </div>
        <svg class="w-4 h-4 text-muted ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>
    </div>

    <transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="absolute left-0 mt-2 w-64 origin-top-left rounded-md bg-white shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none z-[100] overflow-hidden border border-secondary/10"
      >
        <div class="p-3 grid grid-cols-5 gap-2 max-h-64 overflow-y-auto custom-scrollbar">
          <button
            v-for="n in 25"
            :key="n"
            type="button"
            @click="selectAvatar(n)"
            class="group relative aspect-square p-0.5 rounded-[5px] hover:bg-primary/10 transition-all border-2 flex items-center justify-center overflow-hidden"
            :class="modelValue === n ? 'border-primary shadow-sm bg-primary/5' : 'border-transparent hover:scale-110'"
          >
            <img :src="getAvatarUrl(n)" class="w-full h-full rounded-[5px] object-cover" :alt="'Avatar ' + n" />
            <div v-if="modelValue === n" class="absolute inset-0 bg-primary/10 flex items-center justify-center">
              <svg class="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
            </div>
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  modelValue: number
}>()

const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)
const containerRef = ref<HTMLElement | null>(null)

const getAvatarUrl = (n: number) => {
  return new URL(`../assets/avatar/${n}.png`, import.meta.url).href
}

const selectAvatar = (n: number) => {
  emit('update:modelValue', n)
  isOpen.value = false
}

const handleClickOutside = (event: MouseEvent) => {
  if (containerRef.value && !containerRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}
</style>
