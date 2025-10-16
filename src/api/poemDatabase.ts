import http from './http'
import type { AxiosResponse } from 'axios'

// 使用统一的HTTP实例
const api = http

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
      const response = await api.get('/poems', {
        params: filters
      })
      
      if (response.success) {
        return response.data
      } else {
        throw new Error(response.message || '获取诗词列表失败')
      }
    } catch (error: any) {
      console.error('获取诗词列表失败:', error)
      throw new Error(error.message || '网络错误')
    }
  }

  // 根据ID获取诗词
  static async getById(id: number): Promise<Poem> {
    try {
      const response = await api.get(`/poems/${id}`)
      
      if (response.success) {
        return response.data
      } else {
        throw new Error(response.message || '获取诗词详情失败')
      }
    } catch (error: any) {
      console.error('获取诗词详情失败:', error)
      throw new Error(error.message || '网络错误')
    }
  }

  // 创建新诗词
  static async create(poem: Omit<Poem, 'id' | 'created_at' | 'updated_at'>): Promise<Poem> {
    try {
      const response = await api.post('/poems', poem)
      
      if (response.success) {
        return response.data
      } else {
        throw new Error(response.message || '创建诗词失败')
      }
    } catch (error: any) {
      console.error('创建诗词失败:', error)
      throw new Error(error.message || '网络错误')
    }
  }

  // 批量创建诗词
  static async createBatch(poems: Array<Omit<Poem, 'id' | 'created_at' | 'updated_at'>>): Promise<Poem[]> {
    try {
      const response = await api.post('/poems/batch', {
        poems
      })
      
      if (response.success) {
        return response.data
      } else {
        throw new Error(response.message || '批量创建诗词失败')
      }
    } catch (error: any) {
      console.error('批量创建诗词失败:', error)
      throw new Error(error.message || '网络错误')
    }
  }

  // 更新诗词
  static async update(id: number, poem: Partial<Poem>): Promise<Poem> {
    try {
      const response = await api.put(`/poems/${id}`, poem)
      
      if (response.success) {
        return response.data
      } else {
        throw new Error(response.message || '更新诗词失败')
      }
    } catch (error: any) {
      console.error('更新诗词失败:', error)
      throw new Error(error.message || '网络错误')
    }
  }

  // 切换收藏状态
  static async toggleFavorite(id: number): Promise<Poem> {
    try {
      const response = await api.patch(`/poems/${id}/favorite`)
      
      if (response.success) {
        return response.data
      } else {
        throw new Error(response.message || '切换收藏状态失败')
      }
    } catch (error: any) {
      console.error('切换收藏状态失败:', error)
      throw new Error(error.message || '网络错误')
    }
  }

  // 删除诗词
  static async delete(id: number): Promise<Poem> {
    try {
      const response = await api.delete(`/poems/${id}`)
      
      if (response.success) {
        return response.data
      } else {
        throw new Error(response.message || '删除诗词失败')
      }
    } catch (error: any) {
      console.error('删除诗词失败:', error)
      throw new Error(error.message || '网络错误')
    }
  }

  // 获取收藏列表
  static async getFavorites(): Promise<Poem[]> {
    try {
      const response = await api.get('/poems/favorites/list')
      
      if (response.success) {
        return response.data
      } else {
        throw new Error(response.message || '获取收藏列表失败')
      }
    } catch (error: any) {
      console.error('获取收藏列表失败:', error)
      throw new Error(error.message || '网络错误')
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
      const response = await api.get('/poems/stats/overview')
      
      if (response.success) {
        return response.data
      } else {
        throw new Error(response.message || '获取统计信息失败')
      }
    } catch (error: any) {
      console.error('获取统计信息失败:', error)
      throw new Error(error.message || '网络错误')
    }
  }

  // 检查服务器连接
  static async checkConnection(): Promise<boolean> {
    try {
      const response = await http.get('/health')
      return response.success === true
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