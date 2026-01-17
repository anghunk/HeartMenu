import { reactive } from 'vue'

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

interface Notification {
  id: number
  message: string
  type: NotificationType
}

export const notificationState = reactive<{
  notifications: Notification[]
}>({
  notifications: []
})

let nextId = 0

export const showNotification = (message: string, type: NotificationType = 'success', duration = 3000) => {
  const id = nextId++
  const notification: Notification = { id, message, type }
  
  notificationState.notifications.push(notification)
  
  if (duration > 0) {
    setTimeout(() => {
      removeNotification(id)
    }, duration)
  }
}

export const removeNotification = (id: number) => {
  const index = notificationState.notifications.findIndex(n => n.id === id)
  if (index !== -1) {
    notificationState.notifications.splice(index, 1)
  }
}
