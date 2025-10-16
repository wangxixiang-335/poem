import { supabase, isOfflineMode } from '../config/database.js';

// 本地内存存储（用于离线模式）
let localPoems = [];
let nextId = 1;

export class PoemModel {
  // 获取所有诗词
  static async getAll(filters = {}) {
    // 离线模式：使用本地内存存储
    if (isOfflineMode) {
      let poems = [...localPoems];
      
      // 应用筛选条件
      if (filters.dynasty) {
        poems = poems.filter(p => p.dynasty && p.dynasty.toLowerCase().includes(filters.dynasty.toLowerCase()));
      }
      
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        poems = poems.filter(p => 
          (p.title && p.title.toLowerCase().includes(searchTerm)) ||
          (p.author && p.author.toLowerCase().includes(searchTerm)) ||
          (p.content && p.content.toLowerCase().includes(searchTerm))
        );
      }
      
      if (filters.is_favorite !== undefined) {
        poems = poems.filter(p => p.is_favorite === filters.is_favorite);
      }
      
      // 排序
      poems.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
      
      // 分页
      if (filters.limit) {
        const offset = filters.offset || 0;
        poems = poems.slice(offset, offset + parseInt(filters.limit));
      }
      
      return poems;
    }
    
    // 在线模式：使用Supabase
    let query = supabase
      .from('poem')
      .select('*')
      .order('created_at', { ascending: false });

    // 添加筛选条件
    if (filters.dynasty) {
      query = query.ilike('dynasty', `%${filters.dynasty}%`);
    }

    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,author.ilike.%${filters.search}%,content.ilike.%${filters.search}%`);
    }

    if (filters.is_favorite !== undefined) {
      query = query.eq('is_favorite', filters.is_favorite);
    }

    // 添加分页
    if (filters.limit) {
      const offset = filters.offset || 0;
      query = query.range(offset, offset + parseInt(filters.limit) - 1);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  // 根据ID获取诗词
  static async getById(id) {
    // 离线模式：使用本地内存存储
    if (isOfflineMode) {
      const poem = localPoems.find(p => p.id === id);
      if (!poem) throw new Error('诗词不存在');
      return poem;
    }
    
    // 在线模式：使用Supabase
    const { data, error } = await supabase
      .from('poem')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  // 创建新诗词
  static async create(poemData) {
    const { title, author, dynasty, content, preview, image } = poemData;
    
    // 离线模式：使用本地内存存储
    if (isOfflineMode) {
      const newPoem = {
        id: `local_${nextId++}`,
        title,
        author,
        dynasty,
        content: content || preview,
        preview: preview || content,
        image: image || 'https://ai-public.mastergo.com/ai/img_res/48599143c45e1b4cb1d0cd756388f738.jpg',
        is_favorite: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      localPoems.push(newPoem);
      return newPoem;
    }
    
    // 在线模式：使用Supabase
    const { data, error } = await supabase
      .from('poem')
      .insert({
        title,
        author,
        dynasty,
        content: content || preview,
        preview: preview || content,
        image: image || 'https://ai-public.mastergo.com/ai/img_res/48599143c45e1b4cb1d0cd756388f738.jpg'
      })
      .select();
    
    if (error) throw error;
    return data[0];
  }

  // 批量创建诗词
  static async createBatch(poemsData) {
    if (!poemsData || poemsData.length === 0) {
      return [];
    }

    const poemsToInsert = poemsData.map(poem => ({
      title: poem.title,
      author: poem.author,
      dynasty: poem.dynasty,
      content: poem.content || poem.preview,
      preview: poem.preview || poem.content,
      image: poem.image || 'https://ai-public.mastergo.com/ai/img_res/48599143c45e1b4cb1d0cd756388f738.jpg'
    }));

    const { data, error } = await supabase
      .from('poem')
      .insert(poemsToInsert)
      .select();
    
    if (error) throw error;
    return data || [];
  }

  // 更新诗词
  static async update(id, poemData) {
    const { title, author, dynasty, content, preview, image, is_favorite } = poemData;
    
    const { data, error } = await supabase
      .from('poem')
      .update({
        title,
        author,
        dynasty,
        content,
        preview,
        image,
        is_favorite,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data[0];
  }

  // 切换收藏状态
  static async toggleFavorite(id) {
    // 先获取当前状态
    const poem = await this.getById(id);
    if (!poem) throw new Error('诗词不存在');
    
    const { data, error } = await supabase
      .from('poem')
      .update({ 
        is_favorite: !poem.is_favorite,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data[0];
  }

  // 删除诗词
  static async delete(id) {
    const poem = await this.getById(id);
    if (!poem) {
      return null;
    }
    
    const { error } = await supabase
      .from('poem')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
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
    // 获取总数
    const { count: total, error: totalError } = await supabase
      .from('poem')
      .select('*', { count: 'exact', head: true });
    
    if (totalError) throw totalError;
    
    // 获取收藏数
    const { count: favorites, error: favError } = await supabase
      .from('poem')
      .select('*', { count: 'exact', head: true })
      .eq('is_favorite', true);
    
    if (favError) throw favError;
    
    // 获取朝代统计 - 使用正确的Supabase语法
    const { data: allPoems, error: dynError } = await supabase
      .from('poem')
      .select('dynasty');
    
    if (dynError) throw dynError;
    
    // 手动统计朝代分布
    const dynastyCounts = {};
    if (allPoems) {
      allPoems.forEach(poem => {
        dynastyCounts[poem.dynasty] = (dynastyCounts[poem.dynasty] || 0) + 1;
      });
    }
    
    const dynasties = Object.entries(dynastyCounts).map(([dynasty, count]) => ({
      dynasty,
      count
    })).sort((a, b) => b.count - a.count);
    
    return {
      total: total || 0,
      favorites: favorites || 0,
      dynasties: dynasties || []
    };
  }
}