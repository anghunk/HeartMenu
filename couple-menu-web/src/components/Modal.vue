<template>
  <transition name="modal">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div class="w-full max-w-lg p-6 bg-surface rounded-md shadow-xl">
        <div class="flex items-center justify-between pb-3 border-b border-secondary">
          <h3 class="text-2xl font-bold font-heading text-primary">{{ title }}</h3>
          <button @click="$emit('close')" class="text-secondary hover:text-text">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <div class="py-4">
          <slot />
        </div>
        <div class="flex justify-end pt-3 border-t border-secondary">
          <slot name="footer">
            <Button @click="$emit('close')" type="secondary" class="mr-2">取消</Button>
            <Button @click="$emit('confirm')" type="primary">确定</Button>
          </slot>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import Button from './Button.vue'

defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    required: true,
  },
})

defineEmits(['close', 'confirm'])
</script>

<style scoped>
.modal-enter-active, .modal-leave-active {
  transition: opacity 0.3s ease;
}
.modal-enter-from, .modal-leave-to {
  opacity: 0;
}
</style>
