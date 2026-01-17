<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold font-heading text-primary">所有订单</h2>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <svg class="w-8 h-8 text-primary animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>

    <!-- Empty -->
    <div v-else-if="orders.length === 0" class="text-center py-20 text-muted">
      暂无订单记录
    </div>

    <!-- Table -->
    <div v-else class="overflow-x-auto bg-surface border border-secondary rounded-md">
      <table class="min-w-full text-sm divide-y divide-secondary">
        <thead class="bg-background">
          <tr>
            <th class="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted">订单ID</th>
            <th class="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted">用户</th>
            <th class="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted">菜品详情</th>
            <th class="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted">下单时间</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-secondary">
          <tr v-for="order in orders" :key="order.id">
            <td class="px-6 py-4 whitespace-nowrap">{{ order.id }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ getUserName(order.user_id) }}</td>
            <td class="px-6 py-4">
              <div v-for="(item, index) in getItems(order.items)" :key="index" class="text-sm">
                {{ item.name }} x {{ item.qty }}
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">{{ formatDate(order.created_at) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '../../api'
import { showNotification } from '../../utils/notification'

interface User {
  id: number
  username: string
}

interface OrderItem {
  id?: number
  name: string
  qty: number
}

interface Order {
  id: number
  user_id: number
  items: OrderItem[] | string
  created_at: string
}

const orders = ref<Order[]>([])
const users = ref<User[]>([])
const loading = ref(true)

// 获取用户列表
const fetchUsers = async () => {
  try {
    const res = await api.get('/admin/users')
    users.value = res.data.users || []
  } catch (error) {
    console.error('获取用户列表失败', error)
  }
}

// 根据 user_id 获取用户名
const getUserName = (userId: number): string => {
  const user = users.value.find(u => u.id === userId)
  return user?.username || `用户${userId}`
}

const fetchOrders = async () => {
  loading.value = true
  try {
    const res = await api.get('/admin/orders')
    // API 返回 { success: true, data: [...] }
    orders.value = res.data.data || []
  } catch (error) {
    console.error('获取订单失败', error)
    showNotification('获取订单列表失败', 'error')
  } finally {
    loading.value = false
  }
}

// 获取订单菜品，兼容数组和 JSON 字符串格式
const getItems = (items: OrderItem[] | string): OrderItem[] => {
  if (Array.isArray(items)) {
    return items
  }
  try {
    return JSON.parse(items)
  } catch {
    return []
  }
}

const formatDate = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleString('zh-CN')
  } catch {
    return dateStr
  }
}

onMounted(async () => {
  await fetchUsers()
  await fetchOrders()
})
</script>
