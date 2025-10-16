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
}

export interface LoginData {
  email: string
  password: string
}

export interface RegisterData {
  username: string
  email: string
  password: string
}

export const AuthAPI = {
  // 用户注册
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await http.post('/auth/register', data)
      return response
    } catch (error: any) {
      console.error('注册失败:', error)
      throw error
    }
  },

  // 用户登录
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await http.post('/auth/login', data)
      return response
    } catch (error: any) {
      console.error('登录失败:', error)
      throw error
    }
  },

  // 获取当前用户信息
  async getCurrentUser(): Promise<AuthResponse> {
    try {
      const response = await http.get('/auth/me')
      return response
    } catch (error: any) {
      console.error('获取用户信息失败:', error)
      throw error
    }
  },

  // 更新用户信息
  async updateProfile(data: { username?: string; email?: string }): Promise<AuthResponse> {
    try {
      const response = await http.put('/auth/profile', data)
      return response
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