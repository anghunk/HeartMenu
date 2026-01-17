<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold font-heading text-primary">系统设置</h2>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <svg class="w-8 h-8 text-primary animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>

    <template v-else>
    <!-- R2 Storage Settings -->
    <div class="bg-surface border border-secondary rounded-md p-6 mb-6">
      <div class="flex items-center mb-4">
        <svg class="w-6 h-6 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
        </svg>
        <h3 class="text-lg font-semibold text-text">Cloudflare R2 存储配置</h3>
      </div>
      <p class="text-sm text-muted mb-6">配置R2存储桶信息，用于上传菜品图片。所有敏感信息将安全存储在服务端。</p>

      <form @submit.prevent="handleSaveR2Config" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="accountId" class="block text-sm font-medium text-text mb-1">
              Account ID
              <span class="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              v-model="r2Config.accountId" 
              id="accountId" 
              placeholder="Cloudflare Account ID"
              class="block w-full px-3 py-2 bg-white border border-secondary/30 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all sm:text-sm" 
            />
          </div>
          <div>
            <label for="accessKeyId" class="block text-sm font-medium text-text mb-1">
              Access Key ID
              <span class="text-red-500">*</span>
            </label>
            <input 
              type="password" 
              v-model="r2Config.accessKeyId" 
              id="accessKeyId" 
              placeholder="R2 Access Key ID"
              class="block w-full px-3 py-2 bg-white border border-secondary/30 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all sm:text-sm" 
            />
          </div>
          <div>
            <label for="secretAccessKey" class="block text-sm font-medium text-text mb-1">
              Secret Access Key
              <span class="text-red-500">*</span>
            </label>
            <input 
              type="password" 
              v-model="r2Config.secretAccessKey" 
              id="secretAccessKey" 
              placeholder="R2 Secret Access Key"
              class="block w-full px-3 py-2 bg-white border border-secondary/30 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all sm:text-sm" 
            />
          </div>
          <div>
            <label for="bucketName" class="block text-sm font-medium text-text mb-1">
              存储桶名称 (Bucket Name)
              <span class="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              v-model="r2Config.bucketName" 
              id="bucketName" 
              placeholder="your-bucket-name"
              class="block w-full px-3 py-2 bg-white border border-secondary/30 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all sm:text-sm" 
            />
          </div>
          <div>
            <label for="customDomain" class="block text-sm font-medium text-text mb-1">
              自定义域名 (Custom Domain)
            </label>
            <input 
              type="text" 
              v-model="r2Config.customDomain" 
              id="customDomain" 
              placeholder="https://cdn.example.com"
              class="block w-full px-3 py-2 bg-white border border-secondary/30 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all sm:text-sm" 
            />
            <p class="text-xs text-muted mt-1">用于生成图片访问链接，留空则使用默认R2域名</p>
          </div>
          <div>
            <label for="region" class="block text-sm font-medium text-text mb-1">
              区域 (Region)
            </label>
            <select 
              v-model="r2Config.region" 
              id="region"
              class="block w-full px-3 py-2 bg-white border border-secondary/30 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all sm:text-sm"
            >
              <option value="auto">Auto (推荐)</option>
              <option value="wnam">Western North America</option>
              <option value="enam">Eastern North America</option>
              <option value="weur">Western Europe</option>
              <option value="eeur">Eastern Europe</option>
              <option value="apac">Asia Pacific</option>
            </select>
          </div>
        </div>

        <div class="flex items-center justify-between pt-4 border-t border-secondary/30">
          <div class="flex items-center text-sm">
            <span :class="['w-2 h-2 rounded-full mr-2', configStatus.connected ? 'bg-green-500' : 'bg-gray-300']"></span>
            <span class="text-muted">{{ configStatus.message }}</span>
          </div>
          <div class="flex space-x-2">
            <Button @click="handleTestConnection" type="secondary" :loading="testing" :disabled="!canTest">
              测试连接
            </Button>
            <Button type="primary" @click="handleSaveR2Config" :loading="saving">
              保存配置
            </Button>
          </div>
        </div>
      </form>
    </div>

    <!-- Usage Tips -->
    <div class="bg-blue-50 border border-blue-200 rounded-md p-4">
      <div class="flex">
        <svg class="w-5 h-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <div class="text-sm text-blue-700">
          <p class="font-medium mb-1">使用说明</p>
          <ul class="list-disc list-inside space-y-1 text-blue-600">
            <li>在 Cloudflare Dashboard 中创建 R2 存储桶并获取 API 令牌</li>
            <li>确保 API 令牌具有对目标存储桶的读写权限</li>
            <li>配置自定义域名可以获得更快的访问速度和更简洁的URL</li>
            <li>配置保存后，可在菜品管理中直接上传图片到R2</li>
          </ul>
        </div>
      </div>
    </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import api from '../../api'
import Button from '../../components/Button.vue'
import { showNotification } from '../../utils/notification'

// Reactive State
const r2Config = reactive({
  accountId: '',
  accessKeyId: '',
  secretAccessKey: '',
  bucketName: '',
  customDomain: '',
  region: 'auto',
})

const saving = ref(false)
const testing = ref(false)
const loading = ref(true)
const configStatus = reactive({
  connected: false,
  message: '未配置',
})

// Computed
const canTest = computed(() => {
  // 已配置时（显示占位符）或填写了完整信息时可以测试
  const hasConfig = r2Config.accountId && r2Config.bucketName
  const hasKeys = (r2Config.accessKeyId === '********' && r2Config.secretAccessKey === '********') ||
                  (r2Config.accessKeyId && r2Config.accessKeyId !== '********' && 
                   r2Config.secretAccessKey && r2Config.secretAccessKey !== '********')
  return hasConfig && hasKeys
})

// API Calls
const fetchR2Config = async () => {
  loading.value = true
  try {
    const res = await api.get('/admin/settings/r2')
    if (res.data.config) {
      // 只填充非敏感字段，敏感字段显示为占位符
      r2Config.accountId = res.data.config.accountId || ''
      r2Config.bucketName = res.data.config.bucketName || ''
      r2Config.customDomain = res.data.config.customDomain || ''
      r2Config.region = res.data.config.region || 'auto'
      // 敏感字段如果已配置，显示占位符
      if (res.data.config.hasAccessKey) {
        r2Config.accessKeyId = '********'
        r2Config.secretAccessKey = '********'
      }
      if (res.data.config.configured) {
        configStatus.connected = true
        configStatus.message = '已配置'
      }
    }
  } catch (error) {
    // 可能是接口不存在，忽略错误
    console.log('R2 config not found')
  } finally {
    loading.value = false
  }
}

const handleSaveR2Config = async () => {
  if (!r2Config.accountId || !r2Config.bucketName) {
    return showNotification('请填写必填字段', 'error')
  }
  
  // 首次配置时必须填写密钥
  const isFirstConfig = r2Config.accessKeyId === '' || r2Config.secretAccessKey === ''
  const isPlaceholder = r2Config.accessKeyId === '********' || r2Config.secretAccessKey === '********'
  
  if (isFirstConfig && !isPlaceholder) {
    if (!r2Config.accessKeyId || !r2Config.secretAccessKey) {
      return showNotification('首次配置请填写 Access Key', 'error')
    }
  }
  
  // 如果密钥字段是占位符，不提交这些字段
  const payload: any = {
    accountId: r2Config.accountId,
    bucketName: r2Config.bucketName,
    customDomain: r2Config.customDomain,
    region: r2Config.region,
  }
  
  if (r2Config.accessKeyId && r2Config.accessKeyId !== '********') {
    payload.accessKeyId = r2Config.accessKeyId
  }
  if (r2Config.secretAccessKey && r2Config.secretAccessKey !== '********') {
    payload.secretAccessKey = r2Config.secretAccessKey
  }

  saving.value = true
  try {
    const res = await api.post('/admin/settings/r2', payload)
    if (res.data.ok) {
      showNotification('配置保存成功')
      configStatus.connected = true
      configStatus.message = '已配置'
      // 如果是新配置的密钥，保存后显示占位符
      if (payload.accessKeyId) {
        r2Config.accessKeyId = '********'
      }
      if (payload.secretAccessKey) {
        r2Config.secretAccessKey = '********'
      }
    }
  } catch (error: any) {
    showNotification(error.response?.data?.error || '保存失败', 'error')
  } finally {
    saving.value = false
  }
}

const handleTestConnection = async () => {
  testing.value = true
  try {
    const res = await api.post('/admin/settings/r2/test')
    if (res.data.success) {
      configStatus.connected = true
      configStatus.message = res.data.message || '连接成功'
      showNotification(res.data.message || 'R2 连接测试成功')
    } else {
      configStatus.connected = false
      configStatus.message = '连接失败'
      showNotification(res.data.error || '连接测试失败', 'error')
    }
  } catch (error: any) {
    configStatus.connected = false
    configStatus.message = '连接失败'
    showNotification(error.response?.data?.error || '连接测试失败', 'error')
  } finally {
    testing.value = false
  }
}

// Lifecycle
onMounted(fetchR2Config)
</script>
