import { executeQuery, executeTransaction } from '../config/database.js';

export class PoemModel {
  // 获取所有诗词
  static async getAll(filters = {}) {
    let sql = `
      SELECT id, title, author, dynasty, content, preview, image, is_favorite, 
             created_at, updated_at 
      FROM poem 
      WHERE 1=1
    `;
    const params = [];

    // 添加筛选条件
    if (filters.dynasty) {
      sql += ' AND dynasty LIKE ?';
      params.push(`%${filters.dynasty}%`);
    }

    if (filters.search) {
      sql += ' AND (title LIKE ? OR author LIKE ? OR content LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
    }

    if (filters.is_favorite !== undefined) {
      sql += ' AND is_favorite = ?';
      params.push(filters.is_favorite);
    }

    sql += ' ORDER BY created_at DESC';

    // 添加分页
    if (filters.limit) {
      sql += ' LIMIT ?';
      params.push(parseInt(filters.limit));
      
      if (filters.offset) {
        sql += ' OFFSET ?';
        params.push(parseInt(filters.offset));
      }
    }

    return await executeQuery(sql, params);
  }

  // 根据ID获取诗词
  static async getById(id) {
    const sql = `
      SELECT id, title, author, dynasty, content, preview, image, is_favorite,
             created_at, updated_at 
      FROM poem 
      WHERE id = ?
    `;
    const results = await executeQuery(sql, [id]);
    return results[0] || null;
  }

  // 创建新诗词
  static async create(poemData) {
    const { title, author, dynasty, content, preview, image } = poemData;
    
    const sql = `
      INSERT INTO poem (title, author, dynasty, content, preview, image)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const result = await executeQuery(sql, [
      title, 
      author, 
      dynasty, 
      content || preview, 
      preview || content, 
      image || 'https://ai-public.mastergo.com/ai/img_res/48599143c45e1b4cb1d0cd756388f738.jpg'
    ]);
    
    return await this.getById(result.insertId);
  }

  // 批量创建诗词
  static async createBatch(poemsData) {
    if (!poemsData || poemsData.length === 0) {
      return [];
    }

    const queries = poemsData.map(poem => ({
      sql: `
        INSERT INTO poem (title, author, dynasty, content, preview, image)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      params: [
        poem.title,
        poem.author,
        poem.dynasty,
        poem.content || poem.preview,
        poem.preview || poem.content,
        poem.image || 'https://ai-public.mastergo.com/ai/img_res/48599143c45e1b4cb1d0cd756388f738.jpg'
      ]
    }));

    const results = await executeTransaction(queries);
    
    // 获取插入的记录
    const insertIds = results.map(result => result.insertId);
    const createdPoems = [];
    
    for (const id of insertIds) {
      const poem = await this.getById(id);
      if (poem) createdPoems.push(poem);
    }
    
    return createdPoems;
  }

  // 更新诗词
  static async update(id, poemData) {
    const { title, author, dynasty, content, preview, image, is_favorite } = poemData;
    
    const sql = `
      UPDATE poem 
      SET title = ?, author = ?, dynasty = ?, content = ?, preview = ?, 
          image = ?, is_favorite = ?
      WHERE id = ?
    `;
    
    await executeQuery(sql, [
      title, 
      author, 
      dynasty, 
      content, 
      preview, 
      image, 
      is_favorite,
      id
    ]);
    
    return await this.getById(id);
  }

  // 切换收藏状态
  static async toggleFavorite(id) {
    const sql = 'UPDATE poem SET is_favorite = NOT is_favorite WHERE id = ?';
    await executeQuery(sql, [id]);
    return await this.getById(id);
  }

  // 删除诗词
  static async delete(id) {
    const poem = await this.getById(id);
    if (!poem) {
      return null;
    }
    
    const sql = 'DELETE FROM poem WHERE id = ?';
    await executeQuery(sql, [id]);
    return poem;
  }

  // 获取收藏的诗词
  static async getFavorites() {
    return await this.getAll({ is_favorite: true });
  }

  // 搜索诗词
  static async search(query) {
    return await this.getAll({ search: query });
  }

  // 按朝代获取诗词
  static async getByDynasty(dynasty) {
    return await this.getAll({ dynasty });
  }

  // 获取诗词统计信息
  static async getStats() {
    const totalSql = 'SELECT COUNT(*) as total FROM poem';
    const favoriteSql = 'SELECT COUNT(*) as favorites FROM poem WHERE is_favorite = true';
    const dynastySql = `
      SELECT dynasty, COUNT(*) as count 
      FROM poem 
      GROUP BY dynasty 
      ORDER BY count DESC
    `;

    const [totalResult] = await executeQuery(totalSql);
    const [favoriteResult] = await executeQuery(favoriteSql);
    const dynastyResult = await executeQuery(dynastySql);

    return {
      total: totalResult.total,
      favorites: favoriteResult.favorites,
      dynasties: dynastyResult
    };
  }
}