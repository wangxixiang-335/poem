import express from 'express';
import { PoemModel } from '../models/Poem.js';

const router = express.Router();

// 获取所有诗词（支持筛选）
router.get('/', async (req, res) => {
  try {
    const { dynasty, search, is_favorite, limit, offset } = req.query;
    
    const filters = {};
    if (dynasty) filters.dynasty = dynasty;
    if (search) filters.search = search;
    if (is_favorite !== undefined) filters.is_favorite = is_favorite === 'true';
    if (limit) filters.limit = limit;
    if (offset) filters.offset = offset;

    const poems = await PoemModel.getAll(filters);
    res.json({
      success: true,
      data: poems,
      message: '获取诗词列表成功'
    });
  } catch (error) {
    console.error('获取诗词列表失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
});

// 根据ID获取诗词
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const poem = await PoemModel.getById(id);
    
    if (!poem) {
      return res.status(404).json({
        success: false,
        message: '诗词不存在'
      });
    }

    res.json({
      success: true,
      data: poem,
      message: '获取诗词详情成功'
    });
  } catch (error) {
    console.error('获取诗词详情失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
});

// 创建新诗词
router.post('/', async (req, res) => {
  try {
    const poemData = req.body;
    
    // 验证必需字段
    if (!poemData.title || !poemData.author || !poemData.dynasty) {
      return res.status(400).json({
        success: false,
        message: '标题、作者和朝代为必填项'
      });
    }

    const poem = await PoemModel.create(poemData);
    res.status(201).json({
      success: true,
      data: poem,
      message: '创建诗词成功'
    });
  } catch (error) {
    console.error('创建诗词失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
});

// 批量创建诗词
router.post('/batch', async (req, res) => {
  try {
    const { poems } = req.body;
    
    if (!Array.isArray(poems) || poems.length === 0) {
      return res.status(400).json({
        success: false,
        message: '请提供有效的诗词数组'
      });
    }

    // 验证每个诗词的必需字段
    for (const poem of poems) {
      if (!poem.title || !poem.author || !poem.dynasty) {
        return res.status(400).json({
          success: false,
          message: '每首诗词的标题、作者和朝代都为必填项'
        });
      }
    }

    const createdPoems = await PoemModel.createBatch(poems);
    res.status(201).json({
      success: true,
      data: createdPoems,
      message: `成功创建 ${createdPoems.length} 首诗词`
    });
  } catch (error) {
    console.error('批量创建诗词失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
});

// 更新诗词
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const poemData = req.body;

    const existingPoem = await PoemModel.getById(id);
    if (!existingPoem) {
      return res.status(404).json({
        success: false,
        message: '诗词不存在'
      });
    }

    const updatedPoem = await PoemModel.update(id, poemData);
    res.json({
      success: true,
      data: updatedPoem,
      message: '更新诗词成功'
    });
  } catch (error) {
    console.error('更新诗词失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
});

// 切换收藏状态
router.patch('/:id/favorite', async (req, res) => {
  try {
    const { id } = req.params;
    
    const existingPoem = await PoemModel.getById(id);
    if (!existingPoem) {
      return res.status(404).json({
        success: false,
        message: '诗词不存在'
      });
    }

    const updatedPoem = await PoemModel.toggleFavorite(id);
    res.json({
      success: true,
      data: updatedPoem,
      message: `${updatedPoem.is_favorite ? '收藏' : '取消收藏'}成功`
    });
  } catch (error) {
    console.error('切换收藏状态失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
});

// 删除诗词
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedPoem = await PoemModel.delete(id);
    if (!deletedPoem) {
      return res.status(404).json({
        success: false,
        message: '诗词不存在'
      });
    }

    res.json({
      success: true,
      data: deletedPoem,
      message: '删除诗词成功'
    });
  } catch (error) {
    console.error('删除诗词失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
});

// 获取收藏的诗词
router.get('/favorites/list', async (req, res) => {
  try {
    const favorites = await PoemModel.getFavorites();
    res.json({
      success: true,
      data: favorites,
      message: '获取收藏列表成功'
    });
  } catch (error) {
    console.error('获取收藏列表失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
});

// 获取统计信息
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await PoemModel.getStats();
    res.json({
      success: true,
      data: stats,
      message: '获取统计信息成功'
    });
  } catch (error) {
    console.error('获取统计信息失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
});

export default router;