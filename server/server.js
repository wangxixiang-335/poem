import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import { initDatabase } from './config/database.js';
import poemRoutes from './routes/poemRoutes.js';
import authRoutes from './routes/auth.js';
import verificationRoutes from './routes/verification.js';

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件配置
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174', 'http://127.0.0.1:5175'],
  credentials: true
}));

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// 请求日志中间件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// 路由配置
app.use('/api/poems', poemRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/verification', verificationRoutes);

// 健康检查接口
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: '服务器运行正常',
    timestamp: new Date().toISOString()
  });
});

// API健康检查接口
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '服务器运行正常',
    timestamp: new Date().toISOString()
  });
});

// 根路径
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '诗词鉴赏 API 服务器',
    version: '1.0.0',
    endpoints: {
      poems: '/api/poems',
      health: '/health'
    }
  });
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '接口不存在'
  });
});

// 全局错误处理中间件
app.use((error, req, res, next) => {
  console.error('服务器错误:', error);
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// 启动服务器
async function startServer() {
  try {
    // 尝试初始化数据库
    await initDatabase();
    console.log('✅ 数据库连接成功！');
  } catch (error) {
    console.warn('⚠️ 数据库连接失败，服务器将以离线模式启动:', error.message);
    console.warn('💡 前端将使用本地数据存储');
  }
  
  // 无论数据库是否连接成功，都启动服务器
  app.listen(PORT, () => {
    console.log(`🚀 服务器已启动！`);
    console.log(`📍 本地地址: http://localhost:${PORT}`);
    console.log(`🔗 API文档: http://localhost:${PORT}/api/poems`);
    console.log(`💚 健康检查: http://localhost:${PORT}/health`);
    console.log(`🌟 环境: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📝 提示: 如需数据库功能，请配置MySQL并重启服务器`);
  });
}

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('收到 SIGTERM 信号，正在关闭服务器...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('收到 SIGINT 信号，正在关闭服务器...');
  process.exit(0);
});

// 启动应用
startServer();