<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1>诗词鉴赏系统</h1>
        <p>请登录以继续使用</p>
      </div>

      <div class="login-tabs">
        <button 
          class="tab-btn" 
          :class="{ active: isLogin }"
          @click="toggleMode"
        >
          登录
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: !isLogin }"
          @click="toggleMode"
        >
          注册
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="login-form">
        <!-- 注册时才显示用户名 -->
        <div class="form-group" v-if="!isLogin">
          <label for="username">用户名</label>
          <input
            id="username"
            v-model="form.username"
            type="text"
            placeholder="请输入用户名"
            required
            :disabled="loading || showVerificationStep"
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
            :disabled="loading || showVerificationStep"
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
            :disabled="loading || showVerificationStep"
          />
        </div>

        <!-- 验证码步骤 -->
        <div v-if="!isLogin && showVerificationStep" class="form-group">
          <label for="verificationCode">验证码</label>
          <div class="verification-input-group">
            <input
              id="verificationCode"
              v-model="form.verificationCode"
              type="text"
              placeholder="请输入6位验证码"
              maxlength="6"
              required
              :disabled="loading"
            />
            <button 
              type="button" 
              class="send-code-btn"
              :disabled="countdown > 0 || loading"
              @click="sendVerificationCode"
            >
              {{ countdown > 0 ? `${countdown}秒后重试` : '发送验证码' }}
            </button>
          </div>
          <p class="verification-hint">验证码已发送到您的邮箱，请查收</p>
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <button 
          type="submit" 
          class="submit-btn"
          :disabled="loading || !isFormValid"
        >
          {{ loading ? '处理中...' : getButtonText() }}
        </button>
      </form>

      <div class="login-footer">
        <p v-if="isLogin">
          还没有账号？<button class="link-btn" @click="toggleMode">立即注册</button>
        </p>
        <p v-else>
          已有账号？<button class="link-btn" @click="toggleMode">立即登录</button>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { AuthAPI } from '@/api/auth'

const router = useRouter()
const authStore = useAuthStore()

const isLogin = ref(true)
const loading = ref(false)
const error = ref('')
const showVerificationStep = ref(false)
const countdown = ref(0)
let countdownInterval: NodeJS.Timeout | null = null

const form = ref({
  username: '',
  email: '',
  password: '',
  verificationCode: ''
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
  if (!isLogin.value && showVerificationStep.value && !form.value.verificationCode) {
    return false
  }
  return true
})

// 发送验证码
const sendVerificationCode = async () => {
  if (!form.value.email) {
    error.value = '请输入邮箱地址'
    return
  }

  // 验证邮箱格式
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(form.value.email)) {
    error.value = '邮箱格式不正确'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const response = await AuthAPI.sendVerificationCode({ email: form.value.email })

    if (response.success) {
      showVerificationStep.value = true
      startCountdown()
      // 测试环境下显示验证码
      if (response.testCode) {
        console.log('验证码:', response.testCode)
        alert(`测试验证码: ${response.testCode}`)
      }
    } else {
      error.value = response.message || '发送验证码失败'
    }
  } catch (err: any) {
    error.value = err.message || '网络异常，请稍后重试'
  } finally {
    loading.value = false
  }
}

// 开始倒计时
const startCountdown = () => {
  countdown.value = 60
  countdownInterval = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0 && countdownInterval) {
      clearInterval(countdownInterval)
      countdownInterval = null
    }
  }, 1000)
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
      if (!showVerificationStep.value) {
        await sendVerificationCode()
        return
      }
      
      await authStore.register({
        username: form.value.username,
        email: form.value.email,
        password: form.value.password,
        verificationCode: form.value.verificationCode
      })
    }

    // 登录/注册成功，跳转到首页
    router.push('/home')
    
  } catch (err: any) {
    error.value = err.message || '操作失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

// 切换登录/注册模式
const toggleMode = () => {
  isLogin.value = !isLogin.value
  showVerificationStep.value = false
  form.value = { username: '', email: '', password: '', verificationCode: '' }
  error.value = ''
  
  if (countdownInterval) {
    clearInterval(countdownInterval)
    countdownInterval = null
  }
  countdown.value = 0
}

// 获取按钮文本
const getButtonText = () => {
  if (isLogin.value) return '登录'
  if (!showVerificationStep.value) return '发送验证码'
  return '注册'
}

// 组件卸载时清理定时器
onUnmounted(() => {
  if (countdownInterval) {
    clearInterval(countdownInterval)
  }
})
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-card {
  background: white;
  border-radius: 16px;
  padding: 40px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-header h1 {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
}

.login-header p {
  margin: 0;
  color: #6b7280;
  font-size: 16px;
}

.login-tabs {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 24px;
}

.tab-btn {
  flex: 1;
  padding: 12px;
  background: none;
  border: none;
  font-size: 16px;
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

.login-form {
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 16px;
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
  padding: 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
  font-size: 14px;
  margin-bottom: 20px;
}

.submit-btn {
  width: 100%;
  padding: 14px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
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

.login-footer {
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

.verification-input-group {
  display: flex;
  gap: 12px;
}

.verification-input-group input {
  flex: 1;
}

.send-code-btn {
  padding: 12px 16px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  white-space: nowrap;
  min-width: 120px;
}

.send-code-btn:hover:not(:disabled) {
  background: #059669;
}

.send-code-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.verification-hint {
  margin: 8px 0 0 0;
  font-size: 12px;
  color: #6b7280;
}
</style>