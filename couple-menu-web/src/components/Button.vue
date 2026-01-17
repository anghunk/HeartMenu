<template>
  <button
    :type="nativeType"
    :disabled="disabled || loading"
    class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium border rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2"
    :class="[typeClasses, { 'opacity-50 cursor-not-allowed': disabled || loading }]"
  >
    <svg v-if="loading" class="w-5 h-5 mr-3 -ml-1 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  type: {
    type: String as () => 'primary' | 'secondary' | 'danger',
    default: 'secondary',
  },
  nativeType: {
    type: String as () => 'button' | 'submit' | 'reset',
    default: 'button',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const typeClasses = computed(() => {
  switch (props.type) {
    case 'primary':
      return 'text-white bg-primary border-transparent hover:bg-accent focus:ring-primary'
    case 'danger':
      return 'text-white bg-error border-transparent hover:bg-red-700 focus:ring-error'
    default:
      return 'text-text bg-surface border-secondary hover:bg-background focus:ring-primary'
  }
})
</script>
