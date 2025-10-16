import { supabase, initDatabase } from './config/database.js';

async function updateDatabase() {
  try {
    // 初始化Supabase连接
    await initDatabase();
    console.log('✅ Supabase连接成功！');

    // 检查表是否存在
    console.log('📋 检查表结构...');
    const { data: columns, error: columnsError } = await supabase
      .from('poem')
      .select('*')
      .limit(1);

    if (columnsError) {
      console.log('❌ 表不存在或无法访问，请先在Supabase控制台创建poem表');
      console.log('💡 请在Supabase控制台执行以下SQL创建表:');
      console.log(`
        CREATE TABLE poem (
          id BIGSERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          author VARCHAR(100) NOT NULL,
          dynasty VARCHAR(50) NOT NULL,
          content TEXT NOT NULL,
          preview VARCHAR(500),
          image VARCHAR(255),
          is_favorite BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);
      return;
    }

    console.log('✅ 表结构检查完成');

    // 检查是否有数据
    const { data: rows, error: countError } = await supabase
      .from('poem')
      .select('id', { count: 'exact', head: true });

    const count = rows ? rows.length : 0;
    console.log(`📊 当前表中有 ${count} 条记录`);

    if (count === 0) {
      console.log('📝 插入示例数据...');
      
      const sampleData = [
        {
          title: '静夜思',
          author: '李白',
          dynasty: '唐',
          content: '床前明月光，疑是地上霜。举头望明月，低头思故乡。',
          preview: '床前明月光，疑是地上霜...',
          image: '',
          is_favorite: false
        },
        {
          title: '春晓',
          author: '孟浩然',
          dynasty: '唐',
          content: '春眠不觉晓，处处闻啼鸟。夜来风雨声，花落知多少。',
          preview: '春眠不觉晓，处处闻啼鸟...',
          image: '',
          is_favorite: false
        },
        {
          title: '望庐山瀑布',
          author: '李白',
          dynasty: '唐',
          content: '日照香炉生紫烟，遥看瀑布挂前川。飞流直下三千尺，疑是银河落九天。',
          preview: '日照香炉生紫烟，遥看瀑布挂前川...',
          image: '',
          is_favorite: true
        },
        {
          title: '登鹳雀楼',
          author: '王之涣',
          dynasty: '唐',
          content: '白日依山尽，黄河入海流。欲穷千里目，更上一层楼。',
          preview: '白日依山尽，黄河入海流...',
          image: '',
          is_favorite: false
        },
        {
          title: '相思',
          author: '王维',
          dynasty: '唐',
          content: '红豆生南国，春来发几枝。愿君多采撷，此物最相思。',
          preview: '红豆生南国，春来发几枝...',
          image: '',
          is_favorite: true
        }
      ];

      const { data: insertedData, error: insertError } = await supabase
        .from('poem')
        .insert(sampleData)
        .select();

      if (insertError) {
        console.error('❌ 插入数据失败:', insertError.message);
      } else {
        console.log('✅ 示例数据插入成功！');
      }
    }

    // 显示数据
    console.log('📊 表中的数据:');
    const { data: poems, error: selectError } = await supabase
      .from('poem')
      .select('id, title, author, dynasty, is_favorite, created_at')
      .limit(10);

    if (selectError) {
      console.error('❌ 查询数据失败:', selectError.message);
    } else {
      console.table(poems);
    }

  } catch (error) {
    console.error('❌ 数据库操作失败:', error.message);
  }
}

// 执行更新
updateDatabase();