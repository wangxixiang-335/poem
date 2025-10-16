import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// 创建Supabase客户端
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

let supabase;
let isOfflineMode = false;

// 检查环境变量
if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Supabase环境变量未配置，服务器将以离线模式运行');
  console.warn('💡 请检查.env文件中的SUPABASE_URL和SUPABASE_ANON_KEY配置');
  isOfflineMode = true;
  
  // 创建模拟的supabase客户端
  supabase = {
    from: () => ({
      select: () => ({ data: [], error: null }),
      insert: () => ({ data: null, error: new Error('Supabase未配置') }),
      update: () => ({ data: null, error: new Error('Supabase未配置') }),
      delete: () => ({ data: null, error: new Error('Supabase未配置') })
    })
  };
} else {
  // 创建真实的Supabase客户端
  supabase = createClient(supabaseUrl, supabaseKey);
}

// 初始化数据库表
async function initDatabase() {
  if (isOfflineMode) {
    console.log('⚠️ 离线模式：跳过数据库初始化');
    return;
  }
  
  try {
    console.log('正在连接Supabase数据库...');
    
    // 测试连接
    const { data, error } = await supabase.from('poem').select('count').limit(1);
    
    if (error) {
      if (error.message.includes('Invalid API key')) {
        console.error('❌ Supabase API密钥无效，请检查.env文件中的SUPABASE_ANON_KEY');
        console.error('💡 请在Supabase控制台检查API密钥配置和RLS策略');
        throw new Error('Supabase API密钥配置错误');
      } else if (error.message.includes('JWT')) {
        console.error('❌ Supabase JWT令牌无效，请检查API密钥');
        throw new Error('Supabase认证失败');
      } else {
        console.log('poem表不存在或权限问题，将尝试创建表...');
      }
    } else {
      console.log('✅ Supabase数据库连接成功！');
    }
    
    // 检查并创建users表
    await createUsersTableIfNotExists();
    
  } catch (error) {
    console.error('数据库初始化失败:', error.message);
    // 不抛出错误，让服务器继续运行在离线模式
    console.warn('⚠️ 数据库连接失败，服务器将以离线模式运行');
    isOfflineMode = true;
  }
}

// 创建users表（如果不存在）
async function createUsersTableIfNotExists() {
  try {
    // 检查users表是否存在
    const { error: checkError } = await supabase.from('users').select('count').limit(1);
    
    if (checkError && checkError.code === '42P01') { // 表不存在
      console.log('📝 创建users表...');
      
      // 由于Supabase不支持直接执行CREATE TABLE，我们通过插入测试数据来触发表创建
      // 实际表创建需要在Supabase控制台手动执行SQL
      console.log('💡 users表不存在，请在Supabase控制台执行create-tables-fixed.sql文件');
      console.log('💡 或者通过插入第一条用户数据来触发表创建');
      
    } else if (checkError) {
      console.warn('⚠️ 检查users表时出错:', checkError.message);
    } else {
      console.log('✅ users表已存在');
    }
  } catch (error) {
    console.warn('⚠️ 检查users表失败:', error.message);
  }
}

// 获取Supabase客户端
export function getSupabaseClient() {
  return supabase;
}

// 执行查询（适配Supabase语法）
export async function executeQuery(table, options = {}) {
  if (isOfflineMode) {
    return [];
  }
  
  const { select = '*', where = {}, order = {}, limit, offset } = options;
  
  let query = supabase.from(table).select(select);
  
  // 添加where条件
  Object.entries(where).forEach(([key, value]) => {
    query = query.eq(key, value);
  });
  
  // 添加排序
  if (order.by && order.direction) {
    query = query.order(order.by, { ascending: order.direction === 'asc' });
  }
  
  // 添加分页
  if (limit) query = query.limit(limit);
  if (offset) query = query.range(offset, offset + (limit || 10) - 1);
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data;
}

// 插入数据
export async function insertData(table, data) {
  if (isOfflineMode) {
    throw new Error('Supabase未配置，无法插入数据');
  }
  
  const { data: result, error } = await supabase.from(table).insert(data).select();
  if (error) throw error;
  return result;
}

// 更新数据
export async function updateData(table, id, data) {
  if (isOfflineMode) {
    throw new Error('Supabase未配置，无法更新数据');
  }
  
  const { data: result, error } = await supabase.from(table).update(data).eq('id', id).select();
  if (error) throw error;
  return result;
}

// 删除数据
export async function deleteData(table, id) {
  if (isOfflineMode) {
    throw new Error('Supabase未配置，无法删除数据');
  }
  
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) throw error;
  return { success: true };
}

export { supabase, initDatabase, isOfflineMode };