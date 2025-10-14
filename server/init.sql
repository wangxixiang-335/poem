-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS poem_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 使用数据库
USE poem_db;

-- 删除现有的poem表（如果存在）
DROP TABLE IF EXISTS poem;

-- 创建poem表，包含所有必要字段
CREATE TABLE poem (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL COMMENT '诗词标题',
  author VARCHAR(100) NOT NULL COMMENT '作者',
  dynasty VARCHAR(50) NOT NULL COMMENT '朝代',
  content TEXT NOT NULL COMMENT '诗词内容',
  preview TEXT COMMENT '预览文本',
  image VARCHAR(500) COMMENT '配图URL',
  is_favorite BOOLEAN DEFAULT FALSE COMMENT '是否收藏',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='诗词表';

-- 插入一些示例数据
INSERT INTO poem (title, author, dynasty, content, preview, image, is_favorite) VALUES
('静夜思', '李白', '唐代', '床前明月光，疑是地上霜。举头望明月，低头思故乡。', '床前明月光，疑是地上霜。举头望明月，低头思故乡。', 'https://ai-public.mastergo.com/ai/img_res/48599143c45e1b4cb1d0cd756388f738.jpg', FALSE),
('春晓', '孟浩然', '唐代', '春眠不觉晓，处处闻啼鸟。夜来风雨声，花落知多少。', '春眠不觉晓，处处闻啼鸟。夜来风雨声，花落知多少。', 'https://ai-public.mastergo.com/ai/img_res/437f5006c8faaf74d6d7d4197e1d9482.jpg', FALSE),
('水调歌头·明月几时有', '苏轼', '宋代', '明月几时有？把酒问青天。不知天上宫阙，今夕是何年。我欲乘风归去，又恐琼楼玉宇，高处不胜寒。起舞弄清影，何似在人间。\n转朱阁，低绮户，照无眠。不应有恨，何事长向别时圆？人有悲欢离合，月有阴晴圆缺，此事古难全。但愿人长久，千里共婵娟。', '明月几时有？把酒问青天。不知天上宫阙，今夕是何年。', 'https://ai-public.mastergo.com/ai/img_res/156f26c1f21f943949d6e24ce6c4e10c.jpg', FALSE),
('登鹳雀楼', '王之涣', '唐代', '白日依山尽，黄河入海流。欲穷千里目，更上一层楼。', '白日依山尽，黄河入海流。欲穷千里目，更上一层楼。', 'https://ai-public.mastergo.com/ai/img_res/43e7125fe4023d89a1774e4416e1ace4.jpg', FALSE),
('江雪', '柳宗元', '唐代', '千山鸟飞绝，万径人踪灭。孤舟蓑笠翁，独钓寒江雪。', '千山鸟飞绝，万径人踪灭。孤舟蓑笠翁，独钓寒江雪。', 'https://ai-public.mastergo.com/ai/img_res/f0be731204399b0b196cea3d7505fdd2.jpg', FALSE);

-- 创建索引优化查询性能
CREATE INDEX idx_author ON poem(author);
CREATE INDEX idx_dynasty ON poem(dynasty);
CREATE INDEX idx_title ON poem(title);
CREATE INDEX idx_favorite ON poem(is_favorite);