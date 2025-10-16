# Supabase MCP 服务器配置指南

## 已完成配置

### 1. CodeBuddy MCP 服务器配置
已更新 `codebuddy_mcp_settings.json` 文件，添加了Supabase MCP服务器配置。

### 2. 环境变量配置
在 `.env` 文件中添加了Supabase相关的环境变量：
- `SUPABASE_URL`: 您的Supabase项目URL
- `SUPABASE_ANON_KEY`: 您的Supabase匿名密钥
- `SUPABASE_SERVICE_ROLE_KEY`: 您的Supabase服务角色密钥

### 3. 依赖安装
已安装 `@supabase/supabase-js` 包。

### 4. 工具类创建
创建了 `src/utils/supabase.js` 工具类，包含常用的Supabase操作。

## 下一步操作

### 1. 配置Supabase环境变量
请将 `.env` 文件中的占位符替换为您的实际Supabase项目信息：

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 2. 在Vite配置中添加环境变量前缀
在 `vite.config.js` 中添加环境变量前缀：

```javascript
export default defineConfig({
  // ... 其他配置
  define: {
    'process.env': process.env
  }
})
```

### 3. 使用示例

```javascript
import { supabase, SupabaseService } from '@/utils/supabase'

// 查询数据
const poems = await SupabaseService.select('poems', '*', { author: '李白' })

// 插入数据
const newPoem = await SupabaseService.insert('poems', {
  title: '静夜思',
  content: '床前明月光...',
  author: '李白'
})

// 更新数据
const updated = await SupabaseService.update('poems', poemId, { title: '新标题' })

// 删除数据
await SupabaseService.delete('poems', poemId)
```

## MCP 服务器使用

配置完成后，您可以在CodeBuddy中使用Supabase MCP服务器，通过自然语言操作Supabase数据库。

## 注意事项

1. 确保环境变量中的Supabase凭据正确
2. 在生产环境中妥善保管服务角色密钥
3. 根据需要配置Row Level Security (RLS)策略