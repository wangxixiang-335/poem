import axios, { AxiosError, AxiosInstance } from 'axios'

const baseURL = import.meta.env.VITE_API_BASE || 'http://localhost:3001/api'

const http: AxiosInstance = axios.create({
  baseURL,
  timeout: 15000
})

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token') || ''
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`
    } as any
  }
  return config
})

http.interceptors.response.use(
  (res) => {
    // 检查响应结构，如果包含success字段，说明是标准API响应
    const responseData = res.data
    if (responseData && typeof responseData === 'object' && 'success' in responseData) {
      // 如果是成功的标准API响应，直接返回整个响应体
      return responseData
    }
    // 其他情况返回原始数据
    return responseData
  },
  (error: AxiosError) => {
    const status = error.response?.status
    const responseData = error.response?.data as any
    
    if (status === 401 || status === 403) {
      // 清除认证信息
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      // TODO: 跳转登录页面
    }
    
    // 返回具体的错误信息
    const errorMessage = responseData?.message || error.message || '网络异常，请稍后重试'
    console.error('API请求错误:', { status, message: errorMessage })
    
    return Promise.reject({ 
      code: status || -1, 
      message: errorMessage,
      data: responseData
    })
  }
)

export default http