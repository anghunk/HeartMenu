<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold font-heading text-primary">用户管理</h2>
      <Button @click="handleAdd" type="primary">添加账号</Button>
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
            <th class="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted">用户名</th>
            <th class="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted">角色</th>
            <th class="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted">创建时间</th>
            <th class="px-6 py-3 text-xs font-medium tracking-wider text-right uppercase text-muted">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-secondary">
          <tr v-for="user in sortedUsers" :key="user.id" :class="{'bg-primary/5': user.role === 'admin'}">
            <td class="px-6 py-4 whitespace-nowrap">{{ user.id }}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <img :src="getAvatarUrl(user.avatar || 1)" class="w-8 h-8 rounded-[5px] mr-2 bg-background border border-secondary/10" alt="Avatar" />
                <span>{{ user.username }}</span>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="['px-2 inline-flex text-xs leading-5 font-semibold rounded-full', user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800']">
                {{ getRoleLabel(user.role) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">{{ new Date(user.created_at).toLocaleString() }}</td>
            <td class="px-6 py-4 text-right whitespace-nowrap">
              <Button @click="handleEdit(user)" size="small" class="mr-2">编辑</Button>
              <Button @click="handleDelete(user)" type="danger" size="small" :disabled="user.role === 'admin'">删除</Button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add/Edit User Modal -->
    <Modal :show="dialogVisible" :title="isEdit ? '编辑账号' : '添加账号'" @close="dialogVisible = false" @confirm="handleSubmit">
      <form class="space-y-4">
        <div>
          <label for="username" class="block text-sm font-medium text-text">用户名</label>
          <input 
            type="text" 
            v-model="form.username" 
            id="username" 
            placeholder="请输入用户名"
            class="block w-full mt-1 px-3 py-2 bg-white border border-secondary/30 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all sm:text-sm" 
          />
        </div>
        <div>
          <label for="password" class="block text-sm font-medium text-text">密码 {{ isEdit ? '(留空则不修改)' : '' }}</label>
          <input 
            type="password" 
            v-model="form.password" 
            id="password" 
            placeholder="请输入密码"
            class="block w-full mt-1 px-3 py-2 bg-white border border-secondary/30 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all sm:text-sm" 
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-text mb-1">选择头像</label>
          <AvatarPicker v-model="form.avatar" />
        </div>
      </form>
       <template #footer>
        <Button @click="dialogVisible = false" type="secondary" class="mr-2">取消</Button>
        <Button @click="handleSubmit" type="primary" :loading="submitting">确定</Button>
      </template>
    </Modal>

    <!-- Confirm Delete Modal -->
    <Modal :show="confirmDeleteVisible" title="确认删除" @close="confirmDeleteVisible = false" @confirm="confirmDelete">
      <p v-if="userToDelete">你确定要删除用户 {{ userToDelete.username }} 吗？这也会删除该用户的所有订单记录。</p>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed } from 'vue'
import api from '../../api'
import Button from '../../components/Button.vue'
import Modal from '../../components/Modal.vue'
import AvatarPicker from '../../components/AvatarPicker.vue'
import { showNotification } from '../../utils/notification'

// 缓存机制
let cachedUsers: any[] | null = null

// Reactive State
const users = ref<any[]>([])
const loading = ref(true)
const sortedUsers = computed(() => {
  return [...users.value].sort((a, b) => {
    if (a.role === 'admin') return -1;
    if (b.role === 'admin') return 1;
    return 0;
  });
})
const dialogVisible = ref(false)
const confirmDeleteVisible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const userToDelete = ref<any>(null)

const form = reactive({
  id: null as number | null,
  username: '',
  password: '',
  avatar: 1,
})

// API Calls
const fetchUsers = async (forceRefresh = false) => {
  if (cachedUsers && !forceRefresh) {
    users.value = cachedUsers
    loading.value = false
    return
  }
  
  loading.value = true
  try {
    const res = await api.get('/admin/users')
    users.value = res.data.users
    cachedUsers = res.data.users
  } catch (error) {
    showNotification('获取用户列表失败', 'error')
  } finally {
    loading.value = false
  }
}

const handleSubmit = async () => {
  if (!form.username || (!isEdit.value && !form.password)) return showNotification('请填写完整信息', 'error')
  submitting.value = true
  try {
    if (isEdit.value && form.id) {
      const payload: any = {
        username: form.username,
        avatar: form.avatar
      }
      if (form.password) payload.password = form.password
      await api.patch(`/admin/users/${form.id}`, payload)
      showNotification('更新成功')
    } else {
      await api.post('/auth/register', {
        username: form.username,
        password: form.password,
        avatar: form.avatar
      })
      showNotification('添加成功')
    }
    dialogVisible.value = false
    fetchUsers(true)
  } catch (error: any) {
    showNotification(error.response?.data?.error || '操作失败', 'error')
  } finally {
    submitting.value = false
  }
}

const handleDelete = (user: any) => {
  userToDelete.value = user
  confirmDeleteVisible.value = true
}

const confirmDelete = async () => {
  if (!userToDelete.value) return
  try {
    await api.delete(`/admin/users/${userToDelete.value.id}`)
    showNotification('删除成功')
    fetchUsers(true)
  } catch (error) {
    showNotification('删除失败', 'error')
  } finally {
    confirmDeleteVisible.value = false
    userToDelete.value = null
  }
}

// UI Handlers
const getRoleLabel = (role: string) => {
  const roles: Record<string, string> = {
    admin: '管理员',
    user: '用户'
  }
  return roles[role] || role
}

const getAvatarUrl = (n: number) => {
  return new URL(`../../assets/avatar/${n}.png`, import.meta.url).href
}

const handleAdd = () => {
  isEdit.value = false
  form.id = null
  form.username = ''
  form.password = ''
  form.avatar = 1
  dialogVisible.value = true
}

const handleEdit = (user: any) => {
  isEdit.value = true
  form.id = user.id
  form.username = user.username
  form.password = '' // 密码留空
  form.avatar = user.avatar || 1
  dialogVisible.value = true
}

// Lifecycle
onMounted(fetchUsers)
</script>
