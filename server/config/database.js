import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// 创建数据库连接池
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'poem_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
});

// 初始化数据库表
async function initDatabase() {
  try {
    console.log('正在连接数据库...');
    
    // 测试连接
    const connection = await pool.getConnection();
    console.log('数据库连接成功！');
    
    // 创建poem表（如果不存在）
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS poem (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL COMMENT '诗词标题',
        author VARCHAR(100) NOT NULL COMMENT '作者',
        dynasty VARCHAR(50) NOT NULL COMMENT '朝代',
        content TEXT NOT NULL COMMENT '诗词内容',
        preview TEXT COMMENT '预览内容',
        image VARCHAR(500) COMMENT '配图URL',
        is_favorite BOOLEAN DEFAULT FALSE COMMENT '是否收藏',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
        INDEX idx_title (title),
        INDEX idx_author (author),
        INDEX idx_dynasty (dynasty),
        INDEX idx_favorite (is_favorite)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='诗词表';
    `;
    
    await connection.execute(createTableQuery);
    console.log('数据表初始化完成！');
    
    connection.release();
  } catch (error) {
    console.error('数据库初始化失败:', error);
    throw error;
  }
}

// 获取数据库连接
export async function getConnection() {
  return await pool.getConnection();
}

// 执行查询
export async function executeQuery(sql, params = []) {
  const connection = await pool.getConnection();
  try {
    const [results] = await connection.execute(sql, params);
    return results;
  } finally {
    connection.release();
  }
}

// 执行事务
export async function executeTransaction(queries) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const results = [];
    for (const { sql, params } of queries) {
      const [result] = await connection.execute(sql, params);
      results.push(result);
    }
    
    await connection.commit();
    return results;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export { pool, initDatabase };