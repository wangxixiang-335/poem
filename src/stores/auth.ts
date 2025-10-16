import { defineStore } from 'pinia'
import { ref } from 'vue'
import http from '../api/http'

export interface User {
  id: string
  username: string
  email: string
  created_at?: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
}

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('auth_token'))
  const isAuthenticated = ref(!!localStorage.getItem('auth_token'))

  // 从本地存储初始化
  const initFromStorage = () => {
    const storedToken = localStorage.getItem('auth_token')
    const storedUser = localStorage.getItem('auth_user')
    
    if (storedToken) {
      token.value = storedToken
      isAuthenticated.value = true
    }
    
    if (storedUser) {
      try {
        user.value = JSON.parse(storedUser)
      } catch (error) {
        console.error('解析用户信息失败:', error)
        localStorage.removeItem('auth_user')
      }
    }
  }

  // 登录
  const login = async (credentials: { email: string; password: string }) => {
    try {
      const response = await http.post('/auth/login', credentials)
      
      if (response.success) {
        const { user: userData, token: authToken } = response.data
        
        // 更新状态
        user.value = userData
        token.value = authToken
        isAuthenticated.value = true
        
        // 保存到本地存储
        localStorage.setItem('auth_token', authToken)
        localStorage.setItem('auth_user', JSON.stringify(userData))
        
        return response
      } else {
        throw new Error(response.message || '登录失败')
      }
    } catch (error: any) {
      const message = error.message || '登录失败'
      throw new Error(message)
    }
  }

  // 注册
  const register = async (userData: { username: string; email: string; password: string }) => {
    try {
      const response = await http.post('/auth/register', userData)
      
      if (response.success) {
        const { user: newUser, token: authToken } = response.data
        
        // 更新状态
        user.value = newUser
        token.value = authToken
        isAuthenticated.value = true
        
        // 保存到本地存储
        localStorage.setItem('auth_token', authToken)
        localStorage.setItem('auth_user', JSON.stringify(newUser))
        
        return response
      } else {
        throw new Error(response.message || '注册失败')
      }
    } catch (error: any) {
      const message = error.message || '注册失败'
      throw new Error(message)
    }
  }

  // 登出
  const logout = () => {
    user.value = null
    token.value = null
    isAuthenticated.value = false
    
    // 清除本地存储
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
  }

  // 获取当前用户信息
  const getCurrentUser = async () => {
    if (!token.value) {
      throw new Error('未登录')
    }
    
    try {
      const response = await http.get('/auth/me', {
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      })
      
      if (response.success) {
        user.value = response.data.user
        localStorage.setItem('auth_user', JSON.stringify(user.value))
        return response.data.user
      } else {
        throw new Error(response.message || '获取用户信息失败')
      }
    } catch (error: any) {
      // 如果认证失败，清除本地存储
      if (error.code === 401) {
        logout()
      }
      throw new Error(error.message || '获取用户信息失败')
    }
  }

  // 更新用户信息
  const updateProfile = async (profileData: { username?: string; email?: string }) => {
    if (!token.value) {
      throw new Error('未登录')
    }
    
    try {
      const response = await http.put('/auth/profile', profileData, {
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      })
      
      if (response.success) {
        user.value = { ...user.value, ...response.data.user }
        localStorage.setItem('auth_user', JSON.stringify(user.value))
        return response
      } else {
        throw new Error(response.message || '更新失败')
      }
    } catch (error: any) {
      const message = error.message || '更新失败'
      throw new Error(message)
    }
  }

  // 初始化
  initFromStorage()

  return {
    user,
    token,
    isAuthenticated,
    login,
    register,
    logout,
    getCurrentUser,
    updateProfile
  }
})