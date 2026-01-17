<template>
  <div class="px-4 py-4">
    <!-- 页面标题 -->
    <div class="mb-4">
      <h2 class="text-lg font-heading font-bold text-text">今天想吃什么？</h2>
      <p class="text-sm text-muted">点击菜品添加到购物车</p>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-12">
      <svg class="animate-spin h-8 w-8 text-primary mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p class="text-muted text-sm">加载菜单中...</p>
    </div>

    <!-- 空状态 -->
    <div v-else-if="menuItems.length === 0" class="flex flex-col items-center justify-center py-12">
      <div class="text-5xl mb-4">🍽️</div>
      <p class="text-muted text-sm">暂无菜品</p>
      <p class="text-muted text-xs mt-1">请联系管理员添加菜品</p>
    </div>

    <!-- 菜品列表 -->
    <div v-else class="space-y-3">
      <div
        v-for="item in menuItems"
        :key="item.id"
        class="p-3 bg-white rounded-xl overflow-hidden shadow-sm flex active:bg-gray-50 transition-colors cursor-pointer"
        @click="goToDetail(item.id)"
      >
        <!-- 菜品图片 -->
        <div class="w-24 h-24 bg-gray-100 flex-shrink-0 rounded-xl overflow-hidden">
          <img
            v-if="item.image"
            :src="item.image"
            :alt="item.name"
            class="w-full h-full object-cover"
            loading="lazy"
          />
          <div v-else class="w-full h-full flex items-center justify-center text-3xl">
            🍜
          </div>
        </div>
        <!-- 菜品信息 -->
        <div class="pl-4 flex-1 flex flex-col justify-between min-w-0">
          <div>
            <h3 class="font-medium text-text truncate">{{ item.name }}</h3>
            <p v-if="item.desc" class="text-sm text-muted mt-1 line-clamp-2">{{ item.desc }}</p>
          </div>
          <!-- 数量控制 -->
          <div class="flex items-center justify-end mt-2" @click.stop>
            <!-- 未添加时显示添加按钮 -->
            <button
              v-if="getItemQtyInCart(item.id) === 0"
              @click="addToOrder(item)"
              class="px-3 py-1 bg-primary text-white text-xs rounded-full hover:bg-primary/90 transition-colors"
            >
              + 添加
            </button>
            <!-- 已添加时显示增减按钮 -->
            <div v-else class="flex items-center gap-2">
              <button
                @click="decreaseQty(item)"
                class="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 text-text hover:bg-gray-200 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                </svg>
              </button>
              <span class="w-6 text-center font-medium text-text text-sm">{{ getItemQtyInCart(item.id) }}</span>
              <button
                @click="addToOrder(item)"
                class="w-7 h-7 flex items-center justify-center rounded-full bg-primary text-white hover:bg-primary/90 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, inject } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../api'
import { addToCart, getCart, getCartCount, decreaseCartItemQty, type CartItem } from '../../utils/cart'

interface MenuItem {
  id: number
  name: string
  desc: string
  image: string
}

const router = useRouter()
const menuItems = ref<MenuItem[]>([])
const cartItems = ref<CartItem[]>([])
const loading = ref(true)

const updateCartCount = inject<(count: number) => void>('updateCartCount')

const goToDetail = (id: number) => {
  router.push(`/app/detail/${id}`)
}

const fetchMenu = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/menu')
    menuItems.value = data.items || []
  } catch (error) {
    console.error('获取菜单失败', error)
  } finally {
    loading.value = false
  }
}

// 获取某菜品在购物车中的数量
const getItemQtyInCart = (menuId: number): number => {
  const item = cartItems.value.find(c => c.menu_id === menuId)
  return item?.qty || 0
}

// 添加到本地购物车
const addToOrder = (item: MenuItem) => {
  // 添加到本地购物车
  cartItems.value = addToCart({
    menu_id: item.id,
    name: item.name,
    desc: item.desc,
    image: item.image,
  })

  // 更新购物车数量
  if (updateCartCount) {
    updateCartCount(getCartCount())
  }
}

// 减少数量
const decreaseQty = (item: MenuItem) => {
  cartItems.value = decreaseCartItemQty(item.id)
  if (updateCartCount) {
    updateCartCount(getCartCount())
  }
}

onMounted(() => {
  fetchMenu()
  // 初始化购物车数据
  cartItems.value = getCart()
  if (updateCartCount) {
    updateCartCount(getCartCount())
  }
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
