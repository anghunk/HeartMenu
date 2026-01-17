<template>
  <div class="px-4 py-4">
    <!-- Tab 切换 -->
    <div class="flex bg-white rounded-xl p-1 mb-4 shadow-sm">
      <button
        @click="activeTab = 'cart'"
        :class="[
          'flex-1 py-2 text-sm font-medium rounded-lg transition-all',
          activeTab === 'cart' ? 'bg-primary text-white' : 'text-muted hover:text-text'
        ]"
      >
        购物车
        <span v-if="cartItems.length > 0" class="ml-1">({{ cartTotalQty }})</span>
      </button>
      <button
        @click="activeTab = 'orders'"
        :class="[
          'flex-1 py-2 text-sm font-medium rounded-lg transition-all',
          activeTab === 'orders' ? 'bg-primary text-white' : 'text-muted hover:text-text'
        ]"
      >
        已提交订单
        <span v-if="orders.length > 0" class="ml-1">({{ orders.length }})</span>
      </button>
    </div>

    <!-- 购物车 Tab -->
    <div v-show="activeTab === 'cart'">
      <!-- 页面标题 -->
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="text-lg font-heading font-bold text-text">我的购物车</h2>
          <p class="text-sm text-muted">确认后提交订单给 TA</p>
        </div>
        <button
          v-if="cartItems.length > 0"
          @click="showClearConfirm = true"
          class="text-sm text-error hover:text-error/80 transition-colors"
        >
          清空
        </button>
      </div>

      <!-- 空状态 -->
      <div v-if="cartItems.length === 0" class="flex flex-col items-center justify-center py-12">
        <div class="text-5xl mb-4">🛒</div>
        <p class="text-muted text-sm">购物车是空的</p>
        <p class="text-muted text-xs mt-1">快去选择喜欢的菜品吧</p>
        <router-link
          to="/app"
          class="mt-4 px-4 py-2 bg-primary text-white text-sm rounded-full hover:bg-primary/90 transition-colors"
        >
          去点餐
        </router-link>
      </div>

      <!-- 购物车列表 -->
      <div v-else class="space-y-3">
        <TransitionGroup name="list">
          <div
            v-for="item in cartItems"
            :key="item.menu_id"
            class="bg-white rounded-xl p-4 shadow-sm"
          >
            <div class="flex items-center gap-3">
              <!-- 菜品图片 -->
              <div class="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  v-if="item.image"
                  :src="item.image"
                  :alt="item.name"
                  class="w-full h-full object-cover"
                />
                <div v-else class="w-full h-full flex items-center justify-center text-2xl">
                  🍜
                </div>
              </div>
              <!-- 菜品信息 -->
              <div class="flex-1 min-w-0">
                <h3 class="font-medium text-text truncate">{{ item.name }}</h3>
                <p v-if="item.desc" class="text-xs text-muted mt-0.5 truncate">{{ item.desc }}</p>
              </div>
              <!-- 数量控制 -->
              <div class="flex items-center gap-2">
                <button
                  @click="decreaseQty(item)"
                  class="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-text hover:bg-gray-200 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                  </svg>
                </button>
                <span class="w-8 text-center font-medium text-text">{{ item.qty }}</span>
                <button
                  @click="increaseQty(item)"
                  class="w-8 h-8 flex items-center justify-center rounded-full bg-primary text-white hover:bg-primary/90 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </TransitionGroup>

        <!-- 购物车摘要和提交按钮 -->
        <div class="bg-white rounded-xl p-4 shadow-sm mt-4">
          <div class="flex items-center justify-between text-sm mb-4">
            <span class="text-muted">共计</span>
            <span class="font-medium text-text">{{ cartTotalQty }} 道菜品</span>
          </div>
          <button
            @click="submitOrder"
            :disabled="submitting"
            class="w-full py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            <svg v-if="submitting" class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{{ submitting ? '提交中...' : '提交订单' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 已提交订单 Tab -->
    <div v-show="activeTab === 'orders'">
      <!-- 页面标题 -->
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="text-lg font-heading font-bold text-text">已提交订单</h2>
          <p class="text-sm text-muted">与 TA 共享的点餐记录</p>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="loadingOrders" class="flex flex-col items-center justify-center py-12">
        <svg class="animate-spin h-8 w-8 text-primary mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="text-muted text-sm">加载订单中...</p>
      </div>

      <!-- 空状态 -->
      <div v-else-if="orders.length === 0" class="flex flex-col items-center justify-center py-12">
        <div class="text-5xl mb-4">📋</div>
        <p class="text-muted text-sm">还没有提交订单</p>
        <p class="text-muted text-xs mt-1">先选择菜品添加到购物车，再提交订单</p>
      </div>

      <!-- 订单列表 -->
      <div v-else class="space-y-4">
        <div
          v-for="order in orders"
          :key="order.id"
          class="bg-white rounded-xl shadow-sm overflow-hidden"
        >
          <!-- 订单头部 -->
          <div class="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
            <div class="flex items-center gap-2">
              <span class="text-xs text-muted">订单 #{{ order.id }}</span>
              <span class="text-xs text-muted">{{ formatDate(order.created_at) }}</span>
            </div>
            <button
              @click="confirmDeleteOrder(order.id)"
              class="text-xs text-error hover:text-error/80 transition-colors"
            >
              删除
            </button>
          </div>
          <!-- 订单内容 -->
          <div class="p-4 space-y-2">
            <div
              v-for="item in order.items"
              :key="item.menu_id"
              class="flex items-center justify-between text-sm"
            >
              <span class="text-text">{{ item.name }}</span>
              <span class="text-muted">x{{ item.qty }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 清空购物车确认弹窗 -->
    <Transition name="modal">
      <div
        v-if="showClearConfirm"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-6"
        @click.self="showClearConfirm = false"
      >
        <div class="bg-white rounded-2xl p-6 w-full max-w-sm">
          <div class="text-center">
            <div class="text-4xl mb-3">🗑️</div>
            <h3 class="text-lg font-medium text-text mb-2">确定清空购物车？</h3>
            <p class="text-sm text-muted">清空后需要重新选择菜品</p>
          </div>
          <div class="flex gap-3 mt-6">
            <button
              @click="showClearConfirm = false"
              class="flex-1 py-2.5 border border-gray-200 text-text rounded-xl hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              @click="clearCartItems"
              class="flex-1 py-2.5 bg-error text-white rounded-xl hover:bg-error/90 transition-colors"
            >
              确定清空
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 删除订单确认弹窗 -->
    <Transition name="modal">
      <div
        v-if="showDeleteConfirm"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-6"
        @click.self="showDeleteConfirm = false"
      >
        <div class="bg-white rounded-2xl p-6 w-full max-w-sm">
          <div class="text-center">
            <div class="text-4xl mb-3">🗑️</div>
            <h3 class="text-lg font-medium text-text mb-2">确定删除此订单？</h3>
            <p class="text-sm text-muted">删除后无法恢复</p>
          </div>
          <div class="flex gap-3 mt-6">
            <button
              @click="showDeleteConfirm = false"
              class="flex-1 py-2.5 border border-gray-200 text-text rounded-xl hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              @click="deleteOrder"
              :disabled="deleting"
              class="flex-1 py-2.5 bg-error text-white rounded-xl hover:bg-error/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              <svg v-if="deleting" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{{ deleting ? '删除中...' : '确定删除' }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 提交成功提示 -->
    <Transition name="toast">
      <div
        v-if="showSuccessToast"
        class="fixed top-20 left-1/2 -translate-x-1/2 bg-success text-white px-4 py-2 rounded-full text-sm shadow-lg flex items-center gap-2 z-50"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <span>订单提交成功</span>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, inject } from 'vue'
import api from '../../api'
import {
  getCart,
  clearCart,
  increaseCartItemQty,
  decreaseCartItemQty,
  getCartCount,
  type CartItem
} from '../../utils/cart'

interface OrderItem {
  menu_id: number
  name: string
  qty: number
}

interface Order {
  id: number
  items: OrderItem[]
  created_at: string
}

const activeTab = ref<'cart' | 'orders'>('cart')

// 购物车相关
const cartItems = ref<CartItem[]>([])
const showClearConfirm = ref(false)
const submitting = ref(false)
const showSuccessToast = ref(false)

// 已提交订单相关
const orders = ref<Order[]>([])
const loadingOrders = ref(true)
const showDeleteConfirm = ref(false)
const deleteOrderId = ref<number | null>(null)
const deleting = ref(false)

const updateCartCount = inject<(count: number) => void>('updateCartCount')

// 购物车总数量
const cartTotalQty = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + item.qty, 0)
})

// 格式化日期
const formatDate = (dateStr: string) => {
  try {
    const date = new Date(dateStr)
    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return dateStr
  }
}

// 刷新购物车
const refreshCart = () => {
  cartItems.value = getCart()
  if (updateCartCount) {
    updateCartCount(getCartCount())
  }
}

// 增加购物车商品数量
const increaseQty = (item: CartItem) => {
  cartItems.value = increaseCartItemQty(item.menu_id)
  if (updateCartCount) {
    updateCartCount(getCartCount())
  }
}

// 减少购物车商品数量
const decreaseQty = (item: CartItem) => {
  cartItems.value = decreaseCartItemQty(item.menu_id)
  if (updateCartCount) {
    updateCartCount(getCartCount())
  }
}

// 清空购物车
const clearCartItems = () => {
  clearCart()
  cartItems.value = []
  showClearConfirm.value = false
  if (updateCartCount) {
    updateCartCount(0)
  }
}

// 提交订单到服务器
const submitOrder = async () => {
  if (cartItems.value.length === 0) return

  submitting.value = true
  try {
    // 构建订单项数组，一次性提交
    const items = cartItems.value.map(item => ({
      menu_id: item.menu_id,
      qty: item.qty
    }))

    await api.post('/order', { items })

    // 清空本地购物车
    clearCart()
    cartItems.value = []
    if (updateCartCount) {
      updateCartCount(0)
    }

    // 显示成功提示
    showSuccessToast.value = true
    setTimeout(() => {
      showSuccessToast.value = false
    }, 2000)

    // 刷新已提交订单
    await fetchOrders()

    // 切换到已提交订单 Tab
    activeTab.value = 'orders'
  } catch (error) {
    console.error('提交订单失败', error)
  } finally {
    submitting.value = false
  }
}

// 获取订单列表
const fetchOrders = async () => {
  loadingOrders.value = true
  try {
    const { data } = await api.get('/order/list')
    orders.value = data.orders || []
  } catch (error) {
    console.error('获取订单失败', error)
  } finally {
    loadingOrders.value = false
  }
}

// 确认删除订单
const confirmDeleteOrder = (orderId: number) => {
  deleteOrderId.value = orderId
  showDeleteConfirm.value = true
}

// 删除订单
const deleteOrder = async () => {
  if (!deleteOrderId.value) return

  deleting.value = true
  try {
    await api.delete(`/order/${deleteOrderId.value}`)
    orders.value = orders.value.filter(o => o.id !== deleteOrderId.value)
    showDeleteConfirm.value = false
    deleteOrderId.value = null
  } catch (error) {
    console.error('删除订单失败', error)
  } finally {
    deleting.value = false
  }
}

onMounted(() => {
  // 初始化购物车
  refreshCart()
  // 获取已提交订单
  fetchOrders()
})
</script>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .bg-white,
.modal-leave-to .bg-white {
  transform: scale(0.9);
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, -20px);
}
</style>
