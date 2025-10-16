<template>
  <div v-if="show" class="auth-modal" @click.self="$emit('close')">
    <div class="auth-container">
      <div class="auth-header">
        <h3>{{ isLogin ? '用户登录' : '用户注册' }}</h3>
        <button class="close-btn" @click="$emit('close')">×</button>
      </div>

      <div class="auth-tabs">
        <button 
          class="tab-btn" 
          :class="{ active: isLogin }"
          @click="isLogin = true"
        >
          登录
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: !isLogin }"
          @click="isLogin = false"
        >
          注册
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="auth-form">
        <!-- 注册时才显示用户名 -->
        <div class="form-group" v-if="!isLogin">
          <label for="username">用户名</label>
          <input
            id="username"
            v-model="form.username"
            type="text"
            placeholder="请输入用户名"
            required
            :disabled="loading"
          />
        </div>

        <div class="form-group">
          <label for="email">邮箱</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            placeholder="请输入邮箱地址"
            required
            :disabled="loading"
          />
        </div>

        <div class="form-group">
          <label for="password">密码</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            :placeholder="isLogin ? '请输入密码' : '请设置密码（至少6位）'"
            required
            :disabled="loading"
          />
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <button 
          type="submit" 
          class="submit-btn"
          :disabled="loading || !isFormValid"
        >
          {{ loading ? '处理中...' : (isLogin ? '登录' : '注册') }}
        </button>
      </form>

      <div class="auth-footer">
        <p v-if="isLogin">
          还没有账号？<button class="link-btn" @click="isLogin = false">立即注册</button>
        </p>
        <p v-else>
          已有账号？<button class="link-btn" @click="isLogin = true">立即登录</button>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useAuthStore } from '../stores/auth'

interface Props {
  show: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const authStore = useAuthStore()
const isLogin = ref(true)
const loading = ref(false)
const error = ref('')

const form = ref({
  username: '',
  email: '',
  password: ''
})

// 表单验证
const isFormValid = computed(() => {
  if (!form.value.email || !form.value.password) {
    return false
  }
  if (!isLogin.value && !form.value.username) {
    return false
  }
  if (!isLogin.value && form.value.password.length < 6) {
    return false
  }
  return true
})

// 重置表单状态
const resetForm = () => {
  form.value = { username: '', email: '', password: '' }
  error.value = ''
  loading.value = false
}

// 处理表单提交
const handleSubmit = async () => {
  if (!isFormValid.value) return

  loading.value = true
  error.value = ''

  try {
    if (isLogin.value) {
      await authStore.login({
        email: form.value.email,
        password: form.value.password
      })
    } else {
      await authStore.register({
        username: form.value.username,
        email: form.value.email,
        password: form.value.password
      })
    }

    // 登录/注册成功
    emit('success')
    resetForm()
    
  } catch (err: any) {
    error.value = err.message || '操作失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

// 监听显示状态变化
watch(() => props.show, (newVal) => {
  if (!newVal) {
    resetForm()
  }
})
</script>

<style scoped>
.auth-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.auth-container {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 400px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.auth-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.auth-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #6b7280;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.auth-tabs {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
}

.tab-btn {
  flex: 1;
  padding: 12px;
  background: none;
  border: none;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn.active {
  color: #3b82f6;
  border-bottom: 2px solid #3b82f6;
}

.tab-btn:hover:not(.active) {
  background: #f9fafb;
  color: #374151;
}

.auth-form {
  padding: 24px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.form-group input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-group input:disabled {
  background: #f9fafb;
  color: #6b7280;
  cursor: not-allowed;
}

.error-message {
  padding: 10px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  color: #dc2626;
  font-size: 14px;
  margin-bottom: 16px;
}

.submit-btn {
  width: 100%;
  padding: 12px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.submit-btn:hover:not(:disabled) {
  background: #2563eb;
}

.submit-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.auth-footer {
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
  text-align: center;
  font-size: 14px;
  color: #6b7280;
}

.link-btn {
  background: none;
  border: none;
  color: #3b82f6;
  cursor: pointer;
  text-decoration: underline;
  font-size: 14px;
}

.link-btn:hover {
  color: #2563eb;
}
</style>