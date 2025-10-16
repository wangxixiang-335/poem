import { createClient } from '@supabase/supabase-js'

// 从环境变量获取配置（支持Vite和Node.js环境）
const supabaseUrl = process.env.SUPABASE_URL || import.meta.env?.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || import.meta.env?.VITE_SUPABASE_ANON_KEY

// 验证环境变量
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase环境变量未配置，请检查.env文件')
}

// 创建Supabase客户端
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 常用的Supabase操作示例
export class SupabaseService {
  // 查询数据
  static async select(table, columns = '*', filters = {}) {
    let query = supabase.from(table).select(columns)
    
    // 应用过滤器
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        query = query.eq(key, value)
      }
    })
    
    const { data, error } = await query
    if (error) throw error
    return data
  }

  // 插入数据
  static async insert(table, data) {
    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select()
    
    if (error) throw error
    return result
  }

  // 更新数据
  static async update(table, id, data) {
    const { data: result, error } = await supabase
      .from(table)
      .update(data)
      .eq('id', id)
      .select()
    
    if (error) throw error
    return result
  }

  // 删除数据
  static async delete(table, id) {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return true
  }

  // 文件上传
  static async uploadFile(bucket, filePath, file) {
    const { data, error } = await supabase
      .storage
      .from(bucket)
      .upload(filePath, file)
    
    if (error) throw error
    return data
  }

  // 获取文件URL
  static getFileUrl(bucket, filePath) {
    const { data } = supabase
      .storage
      .from(bucket)
      .getPublicUrl(filePath)
    
    return data.publicUrl
  }
}

export default supabase