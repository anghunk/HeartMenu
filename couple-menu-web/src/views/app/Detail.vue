<template>
  <div class="min-h-screen bg-background flex flex-col pb-20">
    <!-- 顶部导航 -->
    <header class="bg-white shadow-sm sticky top-0 z-50">
      <div class="flex items-center px-4 h-14">
        <button 
          @click="router.back()" 
          class="p-2 -ml-2 text-muted hover:text-primary transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 class="ml-2 text-lg font-heading font-bold text-text truncate">菜品详情</h1>
      </div>
    </header>

    <!-- 加载状态 -->
    <div v-if="loading" class="flex flex-col items-center justify-center flex-1 py-12">
      <svg class="animate-spin h-8 w-8 text-primary mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p class="text-muted text-sm">加载中...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="!item" class="flex flex-col items-center justify-center flex-1 py-12 px-6 text-center">
      <div class="text-5xl mb-4">🔍</div>
      <p class="text-text font-medium">未找到该菜品</p>
      <p class="text-muted text-sm mt-2">该菜品可能已被删除或下架</p>
      <button 
        @click="router.push('/app')" 
        class="mt-6 px-6 py-2 bg-primary text-white rounded-full font-medium"
      >
        返回菜单
      </button>
    </div>

    <!-- 菜品内容 -->
    <div v-else class="flex-1 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <!-- 大图展示 -->
      <div class="bg-gray-100 aspect-square overflow-hidden shadow-inner">
        <img
          v-if="item.image"
          :src="item.image"
          :alt="item.name"
          class="w-full h-full object-cover"
        />
        <div v-else class="w-full h-full flex items-center justify-center text-7xl">
          🍜
        </div>
      </div>

      <!-- 菜品文字 -->
      <div class="p-6">
        <div class="flex items-start justify-between gap-4">
          <h2 class="text-2xl font-heading font-bold text-text leading-tight">{{ item.name }}</h2>
        </div>
        
        <div class="mt-6">
          <h3 class="text-sm font-bold text-text uppercase tracking-wider">菜品介绍</h3>
          <p class="mt-3 text-muted leading-relaxed whitespace-pre-wrap">
            {{ item.desc || '暂无详细介绍，大厨正在研发中...' }}
          </p>
        </div>
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div v-if="item" class="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-gray-100 flex items-center justify-between safe-area-inset-bottom">
      <div class="flex items-center gap-4">
        <div v-if="getItemQtyInCart(item.id) > 0" class="flex items-center gap-3">
          <button
            @click="decreaseQty(item)"
            class="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-text hover:bg-gray-200 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
            </svg>
          </button>
          <span class="text-lg font-bold text-text w-6 text-center">{{ getItemQtyInCart(item.id) }}</span>
          <button
            @click="addToOrder(item)"
            class="w-10 h-10 flex items-center justify-center rounded-full bg-primary text-white hover:bg-primary/90 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
        <button
          v-else
          @click="addToOrder(item)"
          class="px-8 py-3 bg-primary text-white rounded-full font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95"
        >
          加入购物车
        </button>
      </div>

      <button 
        @click="router.push('/app/order')" 
        class="relative p-2 text-muted hover:text-primary transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <span
          v-if="getCartCount() > 0"
          class="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white"
        >
          {{ getCartCount() > 99 ? '99+' : getCartCount() }}
        </span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../../api'
import { addToCart, getCart, getCartCount, decreaseCartItemQty, type CartItem } from '../../utils/cart'

interface MenuItem {
  id: number
  name: string
  desc: string
  image: string
}

const route = useRoute()
const router = useRouter()
const item = ref<MenuItem | null>(null)
const cartItems = ref<CartItem[]>([])
const loading = ref(true)

const updateCartCount = inject<(count: number) => void>('updateCartCount')

const fetchDetail = async () => {
  const id = Number(route.params.id)
  loading.value = true
  try {
    const { data } = await api.get('/menu')
    const items: MenuItem[] = data.items || []
    item.value = items.find(i => i.id === id) || null
  } catch (error) {
    console.error('获取菜品详情失败', error)
  } finally {
    loading.value = false
  }
}

// 获取某菜品在购物车中的数量
const getItemQtyInCart = (menuId: number): number => {
  const cartItem = cartItems.value.find(c => c.menu_id === menuId)
  return cartItem?.qty || 0
}

// 添加到本地购物车
const addToOrder = (menuItem: MenuItem) => {
  cartItems.value = addToCart({
    menu_id: menuItem.id,
    name: menuItem.name,
    desc: menuItem.desc,
    image: menuItem.image,
  })

  // 更新购物车数量
  if (updateCartCount) {
    updateCartCount(getCartCount())
  }
}

// 减少数量
const decreaseQty = (menuItem: MenuItem) => {
  cartItems.value = decreaseCartItemQty(menuItem.id)
  if (updateCartCount) {
    updateCartCount(getCartCount())
  }
}

onMounted(() => {
  fetchDetail()
  // 初始化购物车数据
  cartItems.value = getCart()
})
</script>

<style scoped>
.safe-area-inset-bottom {
  padding-bottom: calc(1rem + env(safe-area-inset-bottom));
}

.animate-in {
  animation-duration: 0.5s;
  animation-fill-mode: both;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideInFromBottom {
  from { transform: translateY(1rem); }
  to { transform: translateY(0); }
}

.fade-in {
  animation-name: fadeIn;
}

.slide-in-from-bottom-4 {
  animation-name: slideInFromBottom;
}
</style>
