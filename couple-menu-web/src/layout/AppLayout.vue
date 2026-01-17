<template>
  <div class="app-layout min-h-screen bg-background flex flex-col">
    <!-- 顶部导航栏 -->
    <header v-if="!route.meta.hideHeader" class="bg-white shadow-sm sticky top-0 z-50">
      <div class="flex items-center justify-between px-4 h-14">
        <div class="flex items-center gap-2">
          <span class="text-2xl">💕</span>
          <h1 class="text-lg font-heading font-bold text-primary">情侣点餐</h1>
        </div>
        <div class="flex items-center gap-3">
          <span v-if="userInfo" class="text-sm text-muted hidden sm:block">{{ userInfo.username }}</span>
          <img
            v-if="userInfo"
            :src="getAvatarUrl(userInfo.avatar || 1)"
            class="w-8 h-8 rounded-[5px] bg-gray-100 border border-gray-200"
            alt="头像"
          />
          <button
            @click="handleLogout"
            class="p-2 text-muted hover:text-error transition-colors"
            title="退出登录"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </header>

    <!-- 主内容区域 -->
    <main class="flex-1 overflow-auto" :class="{ 'pb-20': !route.meta.hideFooter }">
      <router-view />
    </main>

    <!-- 底部导航栏 -->
    <nav v-if="!route.meta.hideFooter" class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50">
      <div class="flex justify-around items-center h-16">
        <router-link
          to="/app"
          class="flex flex-col items-center justify-center flex-1 py-2 transition-colors"
          :class="isActiveRoute('/app') ? 'text-primary' : 'text-muted'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          <span class="text-xs mt-1">菜单</span>
        </router-link>
        <router-link
          to="/app/order"
          class="flex flex-col items-center justify-center flex-1 py-2 transition-colors relative"
          :class="isActiveRoute('/app/order') ? 'text-primary' : 'text-muted'"
        >
          <div class="relative">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <!-- 购物车数量角标 -->
            <span
              v-if="cartCount > 0"
              class="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
            >
              {{ cartCount > 99 ? '99+' : cartCount }}
            </span>
          </div>
          <span class="text-xs mt-1">购物车</span>
        </router-link>
      </div>
    </nav>

    <!-- 退出登录确认弹窗 -->
    <Transition name="modal">
      <div
        v-if="showLogoutConfirm"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-6"
        @click.self="showLogoutConfirm = false"
      >
        <div class="bg-white rounded-2xl p-6 w-full max-w-sm">
          <div class="text-center">
            <div class="text-4xl mb-3">👋</div>
            <h3 class="text-lg font-medium text-text mb-2">确定退出登录？</h3>
            <p class="text-sm text-muted">退出后需要重新登录</p>
          </div>
          <div class="flex gap-3 mt-6">
            <button
              @click="showLogoutConfirm = false"
              class="flex-1 py-2.5 border border-gray-200 text-text rounded-xl hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              @click="confirmLogout"
              class="flex-1 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
            >
              确定退出
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, provide } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '../api'
import { getCartCount } from '../utils/cart'

const router = useRouter()
const route = useRoute()

const userInfo = ref<{ username: string; avatar: number } | null>(null)
const cartCount = ref(0)
const showLogoutConfirm = ref(false)

// 提供购物车数量更新方法给子组件
const updateCartCount = (count: number) => {
  cartCount.value = count
}
provide('updateCartCount', updateCartCount)

const isActiveRoute = (path: string) => {
  if (path === '/app') {
    return route.path === '/app' || route.path === '/app/'
  }
  return route.path.startsWith(path)
}

const fetchUserInfo = async () => {
  try {
    const { data } = await api.get('/auth/me')
    userInfo.value = data.user
  } catch (error) {
    console.error('获取用户信息失败', error)
  }
}

const getAvatarUrl = (n: number) => {
  return new URL(`../assets/avatar/${n}.png`, import.meta.url).href
}

const handleLogout = () => {
  showLogoutConfirm.value = true
}

const confirmLogout = () => {
  localStorage.removeItem('app_token')
  router.push('/app/login')
}

onMounted(() => {
  fetchUserInfo()
  // 初始化购物车数量
  cartCount.value = getCartCount()
})
</script>

<style scoped>
.app-layout {
  -webkit-tap-highlight-color: transparent;
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
</style>
