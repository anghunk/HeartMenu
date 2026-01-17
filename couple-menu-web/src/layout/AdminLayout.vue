<template>
  <div class="flex h-screen bg-background font-body text-text">
    <!-- Sidebar -->
    <aside class="flex flex-col w-64 bg-surface border-r border-secondary">
      <div class="flex items-center justify-center h-16 border-b border-secondary">
        <h1 class="text-2xl font-bold font-heading text-primary">情侣点餐后台</h1>
      </div>
      <nav class="flex-1 px-2 py-4 space-y-2">
        <router-link
          to="/admin/menu"
          class="flex items-center px-4 py-2 rounded-md"
          :class="[isActive('/admin/menu') ? 'bg-primary text-white' : 'hover:bg-background']"
        >
          <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          <span>菜品管理</span>
        </router-link>
        <router-link
          to="/admin/users"
          class="flex items-center px-4 py-2 rounded-md"
          :class="[isActive('/admin/users') ? 'bg-primary text-white' : 'hover:bg-background']"
        >
          <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
          <span>用户管理</span>
        </router-link>
        <router-link
          to="/admin/orders"
          class="flex items-center px-4 py-2 rounded-md"
          :class="[isActive('/admin/orders') ? 'bg-primary text-white' : 'hover:bg-background']"
        >
          <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
          <span>所有订单</span>
        </router-link>
        <router-link
          to="/admin/settings"
          class="flex items-center px-4 py-2 rounded-md"
          :class="[isActive('/admin/settings') ? 'bg-primary text-white' : 'hover:bg-background']"
        >
          <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
          <span>系统设置</span>
        </router-link>
      </nav>
      
      <div class="p-4 border-t border-secondary">
        <button
          @click="handleLogout"
          class="flex items-center justify-center w-full p-2 text-muted hover:text-red-500 hover:bg-red-50 rounded-md transition-colors group"
          title="退出登录"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
          <span class="ml-3 text-sm font-medium group-hover:inline hidden md:inline">退出登录</span>
        </button>
      </div>
    </aside>

    <!-- Main content -->
    <div class="flex flex-col flex-1">
      <header class="flex items-center justify-between h-16 px-6 bg-surface border-b border-secondary">
        <div></div>
        <div class="flex items-center space-x-4" v-if="user">
          <div class="flex flex-col items-end mr-2">
            <span class="text-sm font-medium text-text">{{ user.username }}</span>
            <span class="text-xs text-muted">{{ user.role === 'admin' ? '管理员' : '用户' }}</span>
          </div>
          <router-link to="/admin/users" class="relative group">
            <img 
              :src="getAvatarUrl(user.avatar || 1)" 
              class="w-10 h-10 rounded-[10px] bg-background border border-secondary/20 hover:border-primary transition-all cursor-pointer" 
              alt="Avatar" 
            />
            <div class="absolute -bottom-1 -right-1 bg-primary text-white rounded-full p-0.5 border-2 border-surface">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            </div>
          </router-link>
        </div>
      </header>
      <main class="flex-1 p-6 overflow-y-auto">
        <router-view />
      </main>
    </div>

    <!-- Logout Confirm Modal -->
    <Modal 
      :show="logoutConfirmVisible" 
      title="退出登录" 
      @close="logoutConfirmVisible = false" 
      @confirm="confirmLogout"
    >
      <p>您确定要退出登录吗？</p>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../api'
import Modal from '../components/Modal.vue'

const route = useRoute()
const router = useRouter()
const user = ref<any>(null)
const logoutConfirmVisible = ref(false)

const fetchUser = async () => {
  try {
    const res = await api.get('/auth/me')
    user.value = res.data.user
  } catch (error) {
    console.error('Failed to fetch user info', error)
  }
}

const getAvatarUrl = (n: number) => {
  return new URL(`../assets/avatar/${n}.png`, import.meta.url).href
}

onMounted(fetchUser)

const isActive = (path: string) => {
  return route.path.startsWith(path)
}

const handleLogout = () => {
  logoutConfirmVisible.value = true
}

const confirmLogout = () => {
  localStorage.removeItem('admin_token')
  router.push('/admin/login')
}
</script>
