<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold font-heading text-primary">菜品管理</h2>
      <Button @click="handleAdd" type="primary">添加菜品</Button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <svg class="w-8 h-8 text-primary animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>

    <!-- Table -->
    <div v-else class="overflow-x-auto bg-surface border border-secondary rounded-md">
      <table class="min-w-full text-sm divide-y divide-secondary">
        <thead class="bg-background">
          <tr>
            <th class="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted">ID</th>
            <th class="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted">图片</th>
            <th class="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted">菜名</th>
            <th class="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted">描述</th>
            <th class="px-6 py-3 text-xs font-medium tracking-wider text-right uppercase text-muted">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-secondary">
          <tr v-for="item in items" :key="item.id">
            <td class="px-6 py-4 whitespace-nowrap">{{ item.id }}</td>
            <td class="whitespace-nowrap p-2">
              <img 
                v-if="item.image" 
                :src="item.image" 
                :alt="item.name" 
                class="w-24 h-24 rounded-md object-cover border border-secondary/30 bg-background"
                @error="(e) => (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 fill=%22none%22 viewBox=%220 0 24 24%22 stroke=%22%23ccc%22%3E%3Cpath stroke-linecap=%22round%22 stroke-linejoin=%22round%22 stroke-width=%222%22 d=%22M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z%22/%3E%3C/svg%3E'"
              />
              <div v-else class="w-24 h-24 rounded-md border border-secondary/30 bg-background flex items-center justify-center">
                <svg class="w-12 h-12 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">{{ item.name }}</td>
            <td class="px-6 py-4 truncate max-w-xs">{{ item.desc }}</td>
            <td class="px-6 py-4 text-right whitespace-nowrap">
              <Button @click="handleEdit(item)" size="small" class="mr-2">编辑</Button>
              <Button @click="handleDelete(item)" type="danger" size="small">删除</Button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Edit/Add Modal -->
    <Modal :show="dialogVisible" :title="isEdit ? '编辑菜品' : '添加菜品'" @close="dialogVisible = false" @confirm="handleSubmit">
      <form class="space-y-4">
        <div>
          <label for="name" class="block text-sm font-medium text-text">
            菜名
            <span class="text-red-500">*</span>
          </label>
          <input 
            type="text" 
            v-model="form.name" 
            id="name" 
            placeholder="请输入菜名"
            class="block w-full mt-1 px-3 py-2 bg-white border border-secondary/30 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all sm:text-sm" 
          />
        </div>
        <div>
          <label for="desc" class="block text-sm font-medium text-text">描述</label>
          <textarea 
            v-model="form.desc" 
            id="desc" 
            rows="3" 
            placeholder="请输入菜品描述"
            class="block w-full mt-1 px-3 py-2 bg-white border border-secondary/30 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all sm:text-sm"
          ></textarea>
        </div>
        <div>
          <label for="image" class="block text-sm font-medium text-text">图片URL</label>
          <div class="flex mt-1 space-x-2">
            <input 
              type="text" 
              v-model="form.image" 
              id="image" 
              placeholder="请输入图片URL或上传图片"
              class="block flex-1 px-3 py-2 bg-white border border-secondary/30 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all sm:text-sm" 
            />
            <Button 
              type="secondary" 
              @click="triggerFileUpload"
              :loading="uploading"
              :disabled="uploading"
            >
              <svg v-if="!uploading" class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
              </svg>
              {{ uploading ? '上传中...' : '上传到R2' }}
            </Button>
            <input 
              type="file" 
              ref="fileInput" 
              @change="handleFileChange" 
              accept="image/*" 
              class="hidden" 
            />
          </div>
          <p v-if="form.image" class="mt-2 text-xs text-muted">
            <img :src="form.image" class="h-16 rounded-[5px] border border-secondary/30 object-cover" alt="预览" @error="handleImageError" />
          </p>
        </div>
      </form>
       <template #footer>
        <Button @click="dialogVisible = false" type="secondary" class="mr-2">取消</Button>
        <Button @click="handleSubmit" type="primary" :loading="submitting">确定</Button>
      </template>
    </Modal>

    <!-- Confirm Delete Modal -->
    <Modal :show="confirmDeleteVisible" title="确认删除" @close="confirmDeleteVisible = false" @confirm="confirmDelete">
      <p>你确定要删除这个菜品吗？</p>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import api from '../../api'
import Button from '../../components/Button.vue'
import Modal from '../../components/Modal.vue'
import { showNotification } from '../../utils/notification'

// 缓存机制 - 模块级变量，组件重新挂载时保留
let cachedItems: any[] | null = null

// Reactive State
const items = ref<any[]>([])
const loading = ref(true)
const dialogVisible = ref(false)
const confirmDeleteVisible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const uploading = ref(false)
const itemToDelete = ref<any>(null)
const fileInput = ref<HTMLInputElement | null>(null)

const form = reactive({
  id: null,
  name: '',
  desc: '',
  image: '',
})

// API Calls
const fetchItems = async (forceRefresh = false) => {
  // 如果有缓存且不强制刷新，直接使用缓存
  if (cachedItems && !forceRefresh) {
    items.value = cachedItems
    loading.value = false
    return
  }
  
  loading.value = true
  try {
    const res = await api.get('/menu')
    items.value = res.data.items
    cachedItems = res.data.items // 更新缓存
  } catch (error) {
    showNotification('获取菜品列表失败', 'error')
  } finally {
    loading.value = false
  }
}

const handleSubmit = async () => {
  if (!form.name) return showNotification('菜名不能为空', 'error')
  submitting.value = true
  try {
    if (isEdit.value && form.id) {
      await api.put(`/menu/${form.id}`, {
        name: form.name,
        desc: form.desc,
        image: form.image,
      })
    } else {
      await api.post('/menu', {
        name: form.name,
        desc: form.desc,
        image: form.image,
      })
    }
    showNotification(isEdit.value ? '修改成功' : '添加成功')
    dialogVisible.value = false
    fetchItems(true) // 强制刷新
  } catch (error: any) {
    const errorMsg = error.response?.data?.error || error.message || '操作失败'
    showNotification(errorMsg, 'error')
    console.error('Menu API Error:', error.response?.data || error)
  } finally {
    submitting.value = false
  }
}

const handleDelete = (item: any) => {
  itemToDelete.value = item
  confirmDeleteVisible.value = true
}

const confirmDelete = async () => {
  if (!itemToDelete.value) return
  try {
    await api.delete(`/menu/${itemToDelete.value.id}`)
    showNotification('删除成功')
    fetchItems(true) // 强制刷新
  } catch (error) {
    showNotification('删除失败', 'error')
  } finally {
    confirmDeleteVisible.value = false
    itemToDelete.value = null
  }
}


// UI Handlers
const handleAdd = () => {
  isEdit.value = false
  Object.assign(form, { id: null, name: '', desc: '', image: '' })
  dialogVisible.value = true
}

const handleEdit = (item: any) => {
  isEdit.value = true
  Object.assign(form, item)
  dialogVisible.value = true
}

// File Upload
const triggerFileUpload = () => {
  fileInput.value?.click()
}

const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    showNotification('请选择图片文件', 'error')
    return
  }

  // 验证文件大小 (1MB)
  if (file.size > 1 * 1024 * 1024) {
    showNotification('图片大小不能超过1MB', 'error')
    return
  }

  uploading.value = true
  try {
    const formData = new FormData()
    formData.append('file', file)

    const res = await api.post('/admin/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    if (res.data.url) {
      form.image = res.data.url
      showNotification('图片上传成功')
    } else {
      showNotification('上传失败，未获取到图片链接', 'error')
    }
  } catch (error: any) {
    const errorMsg = error.response?.data?.error || '图片上传失败'
    showNotification(errorMsg, 'error')
  } finally {
    uploading.value = false
    // 清空文件输入，允许重新选择同一文件
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }
}

const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement
  target.style.display = 'none'
}

// Lifecycle
onMounted(fetchItems)
</script>
