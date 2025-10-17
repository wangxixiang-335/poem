import http from './http'

export interface User {
  id: string
  username: string
  email: string
  created_at: string
}

export interface AuthResponse {
  success: boolean
  message: string
  data?: {
    user: User
    token: string
  }
  testCode?: string
}

export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  testCode?: string
}

export interface LoginData {
  email: string
  password: string
}

export interface RegisterData {
  username: string
  email: string
  password: string
  verificationCode: string
}

export interface SendVerificationData {
  email: string
}

export const AuthAPI = {
  // 发送验证码
  async sendVerificationCode(data: SendVerificationData): Promise<ApiResponse> {
    try {
      const response = await http.post('/auth/send-verification', data)
      return response as ApiResponse
    } catch (error: any) {
      console.error('发送验证码失败:', error)
      throw error
    }
  },

  // 用户注册
  async register(data: RegisterData): Promise<ApiResponse> {
    try {
      const response = await http.post('/auth/register', data)
      return response as ApiResponse
    } catch (error: any) {
      console.error('注册失败:', error)
      throw error
    }
  },

  // 用户登录
  async login(data: LoginData): Promise<ApiResponse> {
    try {
      const response = await http.post('/auth/login', data)
      return response as ApiResponse
    } catch (error: any) {
      console.error('登录失败:', error)
      throw error
    }
  },

  // 获取当前用户信息
  async getCurrentUser(): Promise<ApiResponse> {
    try {
      const response = await http.get('/auth/me')
      return response as ApiResponse
    } catch (error: any) {
      console.error('获取用户信息失败:', error)
      throw error
    }
  },

  // 更新用户信息
  async updateProfile(data: { username?: string; email?: string }): Promise<ApiResponse> {
    try {
      const response = await http.put('/auth/profile', data)
      return response as ApiResponse
    } catch (error: any) {
      console.error('更新用户信息失败:', error)
      throw error
    }
  },

  // 退出登录
  logout(): void {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    // 可以添加重定向到登录页面的逻辑
  }
}

export default AuthAPI