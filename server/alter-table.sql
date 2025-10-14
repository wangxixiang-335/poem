-- 修改poem表，添加诗词内容相关字段
USE poem_db;

-- 添加诗词内容字段
ALTER TABLE poem 
ADD COLUMN title VARCHAR(255) NOT NULL COMMENT '诗词标题',
ADD COLUMN author VARCHAR(100) NOT NULL COMMENT '作者',
ADD COLUMN dynasty VARCHAR(50) NOT NULL COMMENT '朝代',
ADD COLUMN content TEXT NOT NULL COMMENT '诗词内容',
ADD COLUMN preview VARCHAR(500) COMMENT '诗词预览/摘要',
ADD COLUMN image VARCHAR(255) COMMENT '诗词配图URL',
ADD COLUMN is_favorite BOOLEAN DEFAULT FALSE COMMENT '是否收藏',
ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间';

-- 查看修改后的表结构
DESCRIBE poem;

-- 插入一些示例数据
INSERT INTO poem (title, author, dynasty, content, preview, image, is_favorite) VALUES
('静夜思', '李白', '唐', '床前明月光，疑是地上霜。举头望明月，低头思故乡。', '床前明月光，疑是地上霜...', '', FALSE),
('春晓', '孟浩然', '唐', '春眠不觉晓，处处闻啼鸟。夜来风雨声，花落知多少。', '春眠不觉晓，处处闻啼鸟...', '', FALSE),
('望庐山瀑布', '李白', '唐', '日照香炉生紫烟，遥看瀑布挂前川。飞流直下三千尺，疑是银河落九天。', '日照香炉生紫烟，遥看瀑布挂前川...', '', TRUE),
('登鹳雀楼', '王之涣', '唐', '白日依山尽，黄河入海流。欲穷千里目，更上一层楼。', '白日依山尽，黄河入海流...', '', FALSE),
('相思', '王维', '唐', '红豆生南国，春来发几枝。愿君多采撷，此物最相思。', '红豆生南国，春来发几枝...', '', TRUE);