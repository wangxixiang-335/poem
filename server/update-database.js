import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

async function updateDatabase() {
  let connection;
  
  try {
    // 创建数据库连接
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'poem_db'
    });

    console.log('✅ 数据库连接成功！');

    // 检查表结构
    console.log('📋 检查当前表结构...');
    const [columns] = await connection.execute('DESCRIBE poem');
    console.log('当前字段:', columns.map(col => col.Field));

    // 检查是否已经存在title字段
    const hasTitle = columns.some(col => col.Field === 'title');
    
    if (hasTitle) {
      console.log('⚠️  表字段已经存在，跳过ALTER TABLE操作');
    } else {
      console.log('🔧 开始添加新字段...');
      
      // 添加新字段
      await connection.execute(`
        ALTER TABLE poem 
        ADD COLUMN title VARCHAR(255) NOT NULL COMMENT '诗词标题',
        ADD COLUMN author VARCHAR(100) NOT NULL COMMENT '作者',
        ADD COLUMN dynasty VARCHAR(50) NOT NULL COMMENT '朝代',
        ADD COLUMN content TEXT NOT NULL COMMENT '诗词内容',
        ADD COLUMN preview VARCHAR(500) COMMENT '诗词预览/摘要',
        ADD COLUMN image VARCHAR(255) COMMENT '诗词配图URL',
        ADD COLUMN is_favorite BOOLEAN DEFAULT FALSE COMMENT '是否收藏',
        ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
      `);
      
      console.log('✅ 字段添加成功！');
    }

    // 检查是否有数据
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM poem');
    const count = rows[0].count;
    
    console.log(`📊 当前表中有 ${count} 条记录`);

    if (count === 0) {
      console.log('📝 插入示例数据...');
      
      // 插入示例数据
      await connection.execute(`
        INSERT INTO poem (title, author, dynasty, content, preview, image, is_favorite) VALUES
        ('静夜思', '李白', '唐', '床前明月光，疑是地上霜。举头望明月，低头思故乡。', '床前明月光，疑是地上霜...', '', FALSE),
        ('春晓', '孟浩然', '唐', '春眠不觉晓，处处闻啼鸟。夜来风雨声，花落知多少。', '春眠不觉晓，处处闻啼鸟...', '', FALSE),
        ('望庐山瀑布', '李白', '唐', '日照香炉生紫烟，遥看瀑布挂前川。飞流直下三千尺，疑是银河落九天。', '日照香炉生紫烟，遥看瀑布挂前川...', '', TRUE),
        ('登鹳雀楼', '王之涣', '唐', '白日依山尽，黄河入海流。欲穷千里目，更上一层楼。', '白日依山尽，黄河入海流...', '', FALSE),
        ('相思', '王维', '唐', '红豆生南国，春来发几枝。愿君多采撷，此物最相思。', '红豆生南国，春来发几枝...', '', TRUE)
      `);
      
      console.log('✅ 示例数据插入成功！');
    }

    // 显示最终表结构
    console.log('📋 最终表结构:');
    const [finalColumns] = await connection.execute('DESCRIBE poem');
    console.table(finalColumns);

    // 显示数据
    console.log('📊 表中的数据:');
    const [data] = await connection.execute('SELECT id, title, author, dynasty, is_favorite, created_at FROM poem LIMIT 10');
    console.table(data);

  } catch (error) {
    console.error('❌ 数据库操作失败:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔐 数据库连接已关闭');
    }
  }
}

// 执行更新
updateDatabase();