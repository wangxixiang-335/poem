import axios from 'axios'
import type { AxiosResponse } from 'axios'

// 配置基础URL
const BASE_URL = 'http://localhost:3001/api'

// 创建axios实例
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    console.log(`API请求: ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    console.log(`API响应: ${response.status} ${response.config.url}`)
    return response
  },
  (error) => {
    console.error('响应错误:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

// 诗词数据类型定义
export interface Poem {
  id?: number
  title: string
  author: string
  dynasty: string
  content: string
  preview?: string
  image?: string
  is_favorite?: boolean
  created_at?: string
  updated_at?: string
}

export interface PoemFilters {
  dynasty?: string
  search?: string
  is_favorite?: boolean
  limit?: number
  offset?: number
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message: string
  error?: string
}

export interface PoemStats {
  total: number
  favorites: number
  dynasties: Array<{
    dynasty: string
    count: number
  }>
}

// API方法
export class PoemAPI {
  // 获取所有诗词
  static async getAll(filters?: PoemFilters): Promise<Poem[]> {
    try {
      const response: AxiosResponse<ApiResponse<Poem[]>> = await api.get('/poems', {
        params: filters
      })
      
      if (response.data.success) {
        return response.data.data
      } else {
        throw new Error(response.data.message || '获取诗词列表失败')
      }
    } catch (error: any) {
      console.error('获取诗词列表失败:', error)
      throw new Error(error.response?.data?.message || error.message || '网络错误')
    }
  }

  // 根据ID获取诗词
  static async getById(id: number): Promise<Poem> {
    try {
      const response: AxiosResponse<ApiResponse<Poem>> = await api.get(`/poems/${id}`)
      
      if (response.data.success) {
        return response.data.data
      } else {
        throw new Error(response.data.message || '获取诗词详情失败')
      }
    } catch (error: any) {
      console.error('获取诗词详情失败:', error)
      throw new Error(error.response?.data?.message || error.message || '网络错误')
    }
  }

  // 创建新诗词
  static async create(poem: Omit<Poem, 'id' | 'created_at' | 'updated_at'>): Promise<Poem> {
    try {
      const response: AxiosResponse<ApiResponse<Poem>> = await api.post('/poems', poem)
      
      if (response.data.success) {
        return response.data.data
      } else {
        throw new Error(response.data.message || '创建诗词失败')
      }
    } catch (error: any) {
      console.error('创建诗词失败:', error)
      throw new Error(error.response?.data?.message || error.message || '网络错误')
    }
  }

  // 批量创建诗词
  static async createBatch(poems: Array<Omit<Poem, 'id' | 'created_at' | 'updated_at'>>): Promise<Poem[]> {
    try {
      const response: AxiosResponse<ApiResponse<Poem[]>> = await api.post('/poems/batch', {
        poems
      })
      
      if (response.data.success) {
        return response.data.data
      } else {
        throw new Error(response.data.message || '批量创建诗词失败')
      }
    } catch (error: any) {
      console.error('批量创建诗词失败:', error)
      throw new Error(error.response?.data?.message || error.message || '网络错误')
    }
  }

  // 更新诗词
  static async update(id: number, poem: Partial<Poem>): Promise<Poem> {
    try {
      const response: AxiosResponse<ApiResponse<Poem>> = await api.put(`/poems/${id}`, poem)
      
      if (response.data.success) {
        return response.data.data
      } else {
        throw new Error(response.data.message || '更新诗词失败')
      }
    } catch (error: any) {
      console.error('更新诗词失败:', error)
      throw new Error(error.response?.data?.message || error.message || '网络错误')
    }
  }

  // 切换收藏状态
  static async toggleFavorite(id: number): Promise<Poem> {
    try {
      const response: AxiosResponse<ApiResponse<Poem>> = await api.patch(`/poems/${id}/favorite`)
      
      if (response.data.success) {
        return response.data.data
      } else {
        throw new Error(response.data.message || '切换收藏状态失败')
      }
    } catch (error: any) {
      console.error('切换收藏状态失败:', error)
      throw new Error(error.response?.data?.message || error.message || '网络错误')
    }
  }

  // 删除诗词
  static async delete(id: number): Promise<Poem> {
    try {
      const response: AxiosResponse<ApiResponse<Poem>> = await api.delete(`/poems/${id}`)
      
      if (response.data.success) {
        return response.data.data
      } else {
        throw new Error(response.data.message || '删除诗词失败')
      }
    } catch (error: any) {
      console.error('删除诗词失败:', error)
      throw new Error(error.response?.data?.message || error.message || '网络错误')
    }
  }

  // 获取收藏列表
  static async getFavorites(): Promise<Poem[]> {
    try {
      const response: AxiosResponse<ApiResponse<Poem[]>> = await api.get('/poems/favorites/list')
      
      if (response.data.success) {
        return response.data.data
      } else {
        throw new Error(response.data.message || '获取收藏列表失败')
      }
    } catch (error: any) {
      console.error('获取收藏列表失败:', error)
      throw new Error(error.response?.data?.message || error.message || '网络错误')
    }
  }

  // 搜索诗词
  static async search(query: string): Promise<Poem[]> {
    return this.getAll({ search: query })
  }

  // 按朝代获取诗词
  static async getByDynasty(dynasty: string): Promise<Poem[]> {
    return this.getAll({ dynasty })
  }

  // 获取统计信息
  static async getStats(): Promise<PoemStats> {
    try {
      const response: AxiosResponse<ApiResponse<PoemStats>> = await api.get('/poems/stats/overview')
      
      if (response.data.success) {
        return response.data.data
      } else {
        throw new Error(response.data.message || '获取统计信息失败')
      }
    } catch (error: any) {
      console.error('获取统计信息失败:', error)
      throw new Error(error.response?.data?.message || error.message || '网络错误')
    }
  }

  // 检查服务器连接（直接访问后端 /health，避免 /api 前缀差异）
  static async checkConnection(): Promise<boolean> {
    try {
      const response = await axios.get('http://localhost:3001/health', { timeout: 5000 })
      return response.data?.success === true
    } catch (error) {
      console.error('服务器连接检查失败:', error)
      return false
    }
  }
}

// 兼容原有的导出方式
export const {
  getAll: getAllPoems,
  getById: getPoemById,
  create: createPoem,
  createBatch: createPoemsInBatch,
  update: updatePoem,
  toggleFavorite: togglePoemFavorite,
  delete: deletePoem,
  getFavorites: getFavoritePoems,
  search: searchPoems,
  getByDynasty: getPoemsByDynasty,
  getStats: getPoemStats,
  checkConnection: checkServerConnection
} = PoemAPI

// 导出原有的类型以保持兼容性
export type { AnalysisResult, SearchPoemItem } from './poem'
export { analyzePoem } from './poem'