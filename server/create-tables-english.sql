-- Create poems table first (using existing poem table name)
CREATE TABLE IF NOT EXISTS poem (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  author VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  dynasty VARCHAR(50),
  category VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_poems table
CREATE TABLE IF NOT EXISTS user_poems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  poem_id UUID REFERENCES poem(id) ON DELETE CASCADE,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, poem_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_poem_title ON poem(title);
CREATE INDEX IF NOT EXISTS idx_poem_author ON poem(author);
CREATE INDEX IF NOT EXISTS idx_poem_dynasty ON poem(dynasty);
CREATE INDEX IF NOT EXISTS idx_poem_category ON poem(category);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_user_poems_user_id ON user_poems(user_id);
CREATE INDEX IF NOT EXISTS idx_user_poems_poem_id ON user_poems(poem_id);
CREATE INDEX IF NOT EXISTS idx_user_poems_favorite ON user_poems(is_favorite) WHERE is_favorite = true;

-- Enable RLS
ALTER TABLE poem ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_poems ENABLE ROW LEVEL SECURITY;

-- Create policies for poem table
CREATE POLICY "poem_select_policy" ON poem FOR SELECT USING (true);

-- Create policies for users table
CREATE POLICY "users_select_policy" ON users FOR SELECT USING (true);
CREATE POLICY "users_update_policy" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "users_insert_policy" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "users_delete_policy" ON users FOR DELETE USING (auth.uid() = id);

-- Create policies for user_poems table
CREATE POLICY "user_poems_select_policy" ON user_poems FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_poems_manage_policy" ON user_poems FOR ALL USING (auth.uid() = user_id);