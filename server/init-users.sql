-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- 启用行级安全策略
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 创建策略：所有用户都可以查看用户列表（只显示公开信息）
CREATE POLICY "允许查看用户公开信息" ON users
  FOR SELECT USING (true);

-- 创建策略：用户只能修改自己的信息
CREATE POLICY "允许用户修改自己的信息" ON users
  FOR UPDATE USING (auth.uid() = id);

-- 创建策略：允许匿名用户注册（插入新用户）
CREATE POLICY "允许匿名用户注册" ON users
  FOR INSERT WITH CHECK (true);

-- 创建策略：用户只能删除自己的账户
CREATE POLICY "允许用户删除自己的账户" ON users
  FOR DELETE USING (auth.uid() = id);

-- 创建示例用户（可选）
-- INSERT INTO users (username, email, password) VALUES 
-- ('demo_user', 'demo@example.com', 'hashed_password_here');

-- 创建用户诗词关联表（用于用户收藏和个人诗词）
CREATE TABLE IF NOT EXISTS user_poems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  poem_id UUID REFERENCES poems(id) ON DELETE CASCADE,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, poem_id)
);

-- 为用户诗词表创建索引
CREATE INDEX IF NOT EXISTS idx_user_poems_user_id ON user_poems(user_id);
CREATE INDEX IF NOT EXISTS idx_user_poems_poem_id ON user_poems(poem_id);
CREATE INDEX IF NOT EXISTS idx_user_poems_favorite ON user_poems(is_favorite) WHERE is_favorite = true;

-- 为用户诗词表启用行级安全策略
ALTER TABLE user_poems ENABLE ROW LEVEL SECURITY;

-- 创建策略：用户只能查看自己的诗词关联
CREATE POLICY "允许用户查看自己的诗词关联" ON user_poems
  FOR SELECT USING (auth.uid() = user_id);

-- 创建策略：用户只能修改自己的诗词关联
CREATE POLICY "允许用户修改自己的诗词关联" ON user_poems
  FOR ALL USING (auth.uid() = user_id);