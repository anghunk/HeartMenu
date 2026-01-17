<template>
  <div class="flex items-center justify-center min-h-screen bg-background font-body">
    <div class="w-full max-w-md p-8 space-y-8 bg-surface rounded border border-secondary">
      <div>
        <h2 class="text-3xl font-extrabold text-center font-heading text-primary">
          情侣点餐后台登录
        </h2>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="space-y-4 rounded-md">
          <div>
            <label for="username" class="sr-only">用户名</label>
            <input
              id="username"
              v-model="form.username"
              name="username"
              type="text"
              required
              class="relative block w-full px-3 py-2 text-text placeholder-muted bg-white border border-secondary/30 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:z-10 transition-all sm:text-sm"
              placeholder="用户名"
            />
          </div>
          <div>
            <label for="password" class="sr-only">密码</label>
            <input
              id="password"
              v-model="form.password"
              name="password"
              type="password"
              required
              class="relative block w-full px-3 py-2 text-text placeholder-muted bg-white border border-secondary/30 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:z-10 transition-all sm:text-sm"
              placeholder="密码"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading"
            class="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md group bg-primary hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
          >
            <span v-if="loading" class="absolute inset-y-0 left-0 flex items-center pl-3">
              <svg class="w-5 h-5 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            登录
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../api'
import { showNotification } from '../../utils/notification'

const router = useRouter()
const loading = ref(false)
const form = reactive({
  username: '',
  password: '',
})

onMounted(() => {
  if (import.meta.env.DEV) {
    form.username = import.meta.env.VITE_ADMIN_USERNAME || ''
    form.password = import.meta.env.VITE_ADMIN_PASSWORD || ''
  }
})

const handleLogin = async () => {
  if (!form.username || !form.password) {
    return showNotification('请输入用户名和密码', 'warning')
  }
  loading.value = true
  try {
    const res = await api.post('/auth/admin/login', form)
    localStorage.setItem('admin_token', res.data.token)
    showNotification('登录成功', 'success')
    router.push('/admin')
  } catch (error: any) {
    showNotification(error.response?.data?.error || '登录失败', 'error')
  } finally {
    loading.value = false
  }
}
</script>
