import axios, { AxiosError, AxiosInstance } from 'axios'

const baseURL = import.meta.env.VITE_API_BASE || ''

const http: AxiosInstance = axios.create({
  baseURL,
  timeout: 15000
})

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || ''
  if (token) {
    config.headers = { ...(config.headers || {}), Authorization: `Bearer ${token}` }
  }
  return config
})

http.interceptors.response.use(
  (res) => res.data,
  (error: AxiosError) => {
    const status = error.response?.status
    if (status === 401 || status === 403) {
      // TODO: 跳转登录或刷新令牌
    }
    // 统一提示（避免泄露敏感信息）
    console.error('网络异常', { status, message: error.message })
    return Promise.reject({ code: status || -1, message: '网络异常，请稍后重试' })
  }
)

export default http