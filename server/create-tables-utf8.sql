-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_poems table
CREATE TABLE IF NOT EXISTS user_poems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  poem_id UUID REFERENCES poems(id) ON DELETE CASCADE,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, poem_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_user_poems_user_id ON user_poems(user_id);
CREATE INDEX IF NOT EXISTS idx_user_poems_poem_id ON user_poems(poem_id);
CREATE INDEX IF NOT EXISTS idx_user_poems_favorite ON user_poems(is_favorite) WHERE is_favorite = true;

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_poems ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "allow_select_users" ON users FOR SELECT USING (true);
CREATE POLICY "allow_update_own_user" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "allow_insert_users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_delete_own_user" ON users FOR DELETE USING (auth.uid() = id);

-- Create policies for user_poems table
CREATE POLICY "allow_select_own_user_poems" ON user_poems FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "allow_manage_own_user_poems" ON user_poems FOR ALL USING (auth.uid() = user_id);