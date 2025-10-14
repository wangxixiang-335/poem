# 诗词鉴赏系统

一个基于Vue 3和Express的全栈诗词鉴赏应用，支持诗词的增删改查、收藏功能以及AI智能鉴赏。

## 功能特性

- 📚 **诗词管理**: 添加、删除、查看诗词
- ❤️ **收藏功能**: 收藏/取消收藏诗词
- 🔍 **搜索筛选**: 按标题、作者、朝代、内容搜索
- 🏷️ **分类浏览**: 按朝代分类浏览诗词
- 🤖 **AI鉴赏**: 智能分析诗词的意境、修辞、背景等
- 🌐 **在线搜索**: 从网络搜索并添加新诗词
- 💾 **数据持久化**: MySQL数据库存储

## 技术栈

### 前端
- Vue 3 + TypeScript
- Vite
- Axios

### 后端
- Node.js + Express
- MySQL2
- CORS

## 安装和运行

### 环境要求
- Node.js 16+
- MySQL 5.7+

### 1. 克隆项目
```bash
git clone <repository-url>
cd peom
```

### 2. 安装依赖
```bash
npm install
```

### 3. 数据库配置
1. 启动MySQL服务
2. 修改 `.env` 文件中的数据库配置：
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=poem_db
```

### 4. 初始化数据库
在MySQL中运行 `server/init.sql` 文件：
```sql
source server/init.sql;
```

### 5. 启动服务

#### 方法一：使用启动脚本（Windows）
```bash
start-servers.bat
```

#### 方法二：分别启动
```bash
# 启动后端服务器 (端口3000)
node server/server.js

# 启动前端开发服务器 (端口5173)
npm run dev
```

### 6. 访问应用
- 前端地址: http://localhost:5173
- 后端API: http://localhost:3000

## 项目结构

```
peom/
├── src/                    # 前端源码
│   ├── api/               # API接口
│   │   ├── poem.ts        # 原有诗词API
│   │   └── poemDatabase.ts # 数据库诗词API
│   ├── components/        # Vue组件
│   ├── pages/            # 页面组件
│   │   └── home/         # 主页
│   ├── router/           # 路由配置
│   ├── stores/           # 状态管理
│   └── utils/            # 工具函数
├── server/                # 后端源码
│   ├── config/           # 配置文件
│   │   └── database.js   # 数据库配置
│   ├── models/           # 数据模型
│   │   └── Poem.js       # 诗词模型
│   ├── routes/           # 路由
│   │   └── poemRoutes.js # 诗词路由
│   ├── init.sql          # 数据库初始化脚本
│   └── server.js         # Express服务器
├── .env                   # 环境变量配置
├── start-servers.bat     # Windows启动脚本
└── README.md             # 项目说明
```

## API接口

### 诗词管理
- `GET /api/poems` - 获取所有诗词
- `POST /api/poems` - 创建诗词
- `POST /api/poems/batch` - 批量创建诗词
- `PUT /api/poems/:id` - 更新诗词
- `DELETE /api/poems/:id` - 删除诗词
- `PUT /api/poems/:id/favorite` - 切换收藏状态

### 系统状态
- `GET /api/health` - 检查服务器状态

## 数据库结构

### poem表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 自增主键 |
| title | VARCHAR(255) | 诗词标题 |
| author | VARCHAR(100) | 作者 |
| dynasty | VARCHAR(50) | 朝代 |
| content | TEXT | 诗词内容 |
| preview | TEXT | 预览文本 |
| image | VARCHAR(500) | 配图URL |
| is_favorite | BOOLEAN | 是否收藏 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

## 使用说明

1. **浏览诗词**: 在首页可以浏览所有诗词，支持分类筛选
2. **搜索诗词**: 点击搜索图标，输入关键词搜索
3. **收藏诗词**: 点击诗词卡片上的心形图标收藏/取消收藏
4. **删除诗词**: 点击垃圾桶图标删除诗词（需要数据库连接）
5. **查看详情**: 点击诗词卡片查看详细信息
6. **AI鉴赏**: 在诗词详情页点击"智能鉴赏"获取AI分析
7. **在线搜索**: 在搜索栏点击"在线搜索"从网络添加新诗词

## 故障排除

### 数据库连接失败
- 确保MySQL服务已启动
- 检查 `.env` 文件中的数据库配置
- 确保数据库 `poem_db` 已创建

### 端口占用
- 如果3000端口被占用，修改 `server/server.js` 中的端口号
- 如果5173端口被占用，Vite会自动选择其他端口

### 依赖安装失败
- 尝试删除 `node_modules` 文件夹后重新安装
- 使用 `npm cache clean --force` 清理缓存

## 开发说明

- 前端使用Vue 3 Composition API + TypeScript
- 后端采用RESTful API设计
- 数据库使用MySQL，支持事务操作
- 前后端分离架构，支持跨域请求

## 许可证

MIT License