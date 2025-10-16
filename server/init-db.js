import { supabase } from './config/database.js';

async function initDatabase() {
  try {
    console.log('正在初始化用户表...');

    // 创建用户表
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // 创建用户诗词关联表
    const createUserPoemsTable = `
      CREATE TABLE IF NOT EXISTS user_poems (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        poem_id UUID REFERENCES poems(id) ON DELETE CASCADE,
        is_favorite BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, poem_id)
      );
    `;

    // 执行SQL
    const { error: usersError } = await supabase.rpc('exec_sql', { sql: createUsersTable });
    if (usersError) {
      console.log('用户表可能已存在:', usersError.message);
    } else {
      console.log('✅ 用户表创建成功');
    }

    const { error: userPoemsError } = await supabase.rpc('exec_sql', { sql: createUserPoemsTable });
    if (userPoemsError) {
      console.log('用户诗词关联表可能已存在:', userPoemsError.message);
    } else {
      console.log('✅ 用户诗词关联表创建成功');
    }

    console.log('✅ 数据库初始化完成');
    
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
  }
}

// 直接执行初始化
initDatabase();