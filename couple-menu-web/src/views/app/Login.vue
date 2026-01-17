<template>
  <div class="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12">
    <!-- Logo 和标题 -->
    <div class="text-center mb-8">
      <div class="text-6xl mb-4">💕</div>
      <h1 class="text-2xl font-heading font-bold text-primary mb-2">情侣点餐</h1>
      <p class="text-muted text-sm">与 TA 一起享受美食时光</p>
    </div>

    <!-- 登录表单 -->
    <div class="w-full max-w-sm bg-white rounded-2xl shadow-lg p-6">
      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-text mb-1.5">用户名</label>
          <input
            v-model="form.username"
            type="text"
            placeholder="请输入用户名"
            class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            :disabled="loading"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-text mb-1.5">密码</label>
          <input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            :disabled="loading"
          />
        </div>

        <!-- 错误提示 -->
        <div v-if="errorMsg" class="text-error text-sm text-center py-2">
          {{ errorMsg }}
        </div>

        <button
          type="submit"
          :disabled="loading || !form.username || !form.password"
          class="w-full py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          <svg v-if="loading" class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>{{ loading ? '登录中...' : '登录' }}</span>
        </button>
      </form>
    </div>

    <!-- 底部提示 -->
    <p class="mt-6 text-xs text-muted text-center">
      请使用管理员为您创建的账号登录
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../api'

const router = useRouter()

const form = reactive({
  username: '',
  password: '',
})

const loading = ref(false)
const errorMsg = ref('')

const handleLogin = async () => {
  if (!form.username || !form.password) return

  loading.value = true
  errorMsg.value = ''

  try {
    const { data } = await api.post('/auth/user/login', {
      username: form.username,
      password: form.password,
    })

    if (data.token) {
      localStorage.setItem('app_token', data.token)
      router.push('/app')
    } else {
      errorMsg.value = '登录失败，请重试'
    }
  } catch (error: any) {
    if (error.response?.status === 401) {
      errorMsg.value = '用户名或密码错误'
    } else if (error.response?.status === 403) {
      errorMsg.value = '该账号无权限登录点餐端'
    } else {
      errorMsg.value = error.response?.data?.error || '登录失败，请重试'
    }
  } finally {
    loading.value = false
  }
}
</script>
