<template>
  <div class="fixed top-5 right-5 z-[9999] flex flex-col items-end space-y-3 pointer-events-none">
    <TransitionGroup 
      name="notification"
      tag="div"
      class="flex flex-col items-end space-y-3"
    >
      <div
        v-for="note in notificationState.notifications"
        :key="note.id"
        class="pointer-events-auto min-w-[300px] max-w-md p-4 rounded-lg shadow-xl border-l-4 flex items-center justify-between transition-all duration-300 bg-white"
        :class="getTypeStyles(note.type)"
      >
        <div class="flex items-center space-x-3">
          <!-- Icons -->
          <div :class="getIconColor(note.type)">
            <svg v-if="note.type === 'success'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <svg v-else-if="note.type === 'error'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <svg v-else-if="note.type === 'warning'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <p class="text-sm font-medium text-text">{{ note.message }}</p>
        </div>
        <button @click="removeNotification(note.id)" class="text-muted hover:text-text transition-colors ml-4">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { notificationState, removeNotification, type NotificationType } from '../utils/notification'

const getTypeStyles = (type: NotificationType) => {
  switch (type) {
    case 'success': return 'border-success shadow-success/10'
    case 'error': return 'border-error shadow-error/10'
    case 'warning': return 'border-warning shadow-warning/10'
    case 'info': return 'border-info shadow-info/10'
    default: return 'border-primary shadow-primary/10'
  }
}

const getIconColor = (type: NotificationType) => {
  switch (type) {
    case 'success': return 'text-success'
    case 'error': return 'text-error'
    case 'warning': return 'text-warning'
    case 'info': return 'text-info'
    default: return 'text-primary'
  }
}
</script>

<style scoped>
.notification-enter-active,
.notification-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(-10px);
}

/* List moving animation */
.notification-move {
  transition: transform 0.4s ease;
}

.notification-leave-active {
  position: absolute;
}
</style>
