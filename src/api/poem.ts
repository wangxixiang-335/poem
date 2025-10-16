import http from './http'

export interface PoemAnalyzeRequest {
  title: string
  author: string
  dynasty: string
  content: string
}

export interface AnalysisResult {
  mood: string        // 意境与情感
  rhetoric: string    // 修辞与技巧
  background: string  // 创作背景与历史语境
  commentary: string  // 点评与综合鉴赏
}

// 在线搜索诗词请求参数
export interface PoemSearchRequest {
  keyword: string   // 搜索关键词（标题、作者、内容）
  page?: number     // 页码，默认1
  limit?: number    // 每页数量，默认10
}

// 搜索结果中的诗词项
export interface SearchPoemItem {
  id: string
  title: string
  author: string
  dynasty: string
  content: string
  preview: string
  image?: string
}

// 在线搜索响应
export interface PoemSearchResponse {
  poems: SearchPoemItem[]
  total: number
  page: number
  limit: number
}

/**
 * 智能诗词鉴赏
 * - 通过后端接口进行解析，返回多维度鉴赏结果
 * - 支持取消：传入 AbortSignal（组件关闭时中止）
 * - 开发环境下使用 Mock 数据
 */
export function analyzePoem(payload: PoemAnalyzeRequest, signal?: AbortSignal) {
  // 开发环境 Mock 数据
  if (import.meta.env.DEV) {
    return new Promise<AnalysisResult>((resolve, reject) => {
      const timer = setTimeout(() => {
        const mockData: AnalysisResult = {
          mood: `《${payload.title}》营造了一种${payload.dynasty === '唐代' ? '清新淡雅' : '婉约深沉'}的意境。作者${payload.author}通过细腻的情感表达，将${payload.dynasty === '唐代' ? '对自然的热爱与人生的感悟' : '内心的思考与情感的波澜'}娓娓道来，让读者仿佛置身其中，感受到那份${payload.title.includes('思') ? '思乡之情' : payload.title.includes('春') ? '春日之美' : '人生感慨'}。`,
          
          rhetoric: `这首诗运用了多种修辞手法：${payload.content.includes('明月') ? '以月为意象，寓情于景' : ''}${payload.content.includes('花') ? '借花喻人，情景交融' : ''}${payload.content.includes('水') || payload.content.includes('江') ? '以水喻情，动静结合' : ''}。诗人巧妙地运用${payload.dynasty === '宋代' ? '典型的宋词手法，词句优美，韵律和谐' : '唐诗的格律严谨，对仗工整'}，使得整首诗读来朗朗上口，意境深远。`,
          
          background: `${payload.title}创作于${payload.dynasty}，正值${payload.dynasty === '唐代' ? '唐朝文化繁荣，诗歌创作达到巅峰' : payload.dynasty === '宋代' ? '宋代文人雅士盛行，词风婉约' : '文学发展的重要时期'}。${payload.author}作为${payload.dynasty}著名诗人，其作品往往反映了当时的社会风貌与个人情怀。这首诗的创作背景可能与作者的${payload.title.includes('思') ? '思乡经历' : payload.title.includes('春') ? '春日感怀' : '人生感悟'}密切相关。`,
          
          commentary: `《${payload.title}》堪称${payload.dynasty}诗歌的经典之作。全诗结构严谨，层次分明，从${payload.content.split('，')[0] || '开篇'}入手，逐步展开情感的抒发。${payload.author}以其深厚的文学功底和敏锐的情感触觉，将${payload.title.includes('静') ? '静谧的夜晚' : payload.title.includes('春') ? '春日的美好' : '人生的感悟'}描绘得淋漓尽致。这首诗不仅在当时广为传颂，至今仍被人们所喜爱，足见其艺术价值和文学地位。`
        }
        resolve(mockData)
      }, 1500) // 模拟网络延迟
      
      // 支持取消
      if (signal) {
        signal.addEventListener('abort', () => {
          clearTimeout(timer)
          reject(new Error('请求已取消'))
        })
      }
    })
  }
  
  // 生产环境调用真实接口
  return http.post<AnalysisResult>('/poem/analyze', payload, { signal })
}

// 诗词数据库（包含更多真实的诗词数据）
const poemDatabase = [
  // 李白诗词
  {
    id: 'libai_1',
    title: '静夜思',
    author: '李白',
    dynasty: '唐代',
    content: '床前明月光，疑是地上霜。举头望明月，低头思故乡。',
    preview: '床前明月光，疑是地上霜。举头望明月，低头思故乡。',
    image: 'https://ai-public.mastergo.com/ai/img_res/48599143c45e1b4cb1d0cd756388f738.jpg'
  },
  {
    id: 'libai_2',
    title: '望庐山瀑布',
    author: '李白',
    dynasty: '唐代',
    content: '日照香炉生紫烟，遥看瀑布挂前川。飞流直下三千尺，疑是银河落九天。',
    preview: '日照香炉生紫烟，遥看瀑布挂前川。飞流直下三千尺，疑是银河落九天。',
    image: 'https://ai-public.mastergo.com/ai/img_res/437f5006c8faaf74d6d7d4197e1d9482.jpg'
  },
  {
    id: 'libai_3',
    title: '早发白帝城',
    author: '李白',
    dynasty: '唐代',
    content: '朝辞白帝彩云间，千里江陵一日还。两岸猿声啼不住，轻舟已过万重山。',
    preview: '朝辞白帝彩云间，千里江陵一日还。两岸猿声啼不住，轻舟已过万重山。',
    image: 'https://ai-public.mastergo.com/ai/img_res/156f26c1f21f943949d6e24ce6c4e10c.jpg'
  },
  
  // 杜甫诗词
  {
    id: 'dufu_1',
    title: '春望',
    author: '杜甫',
    dynasty: '唐代',
    content: '国破山河在，城春草木深。感时花溅泪，恨别鸟惊心。烽火连三月，家书抵万金。白头搔更短，浑欲不胜簪。',
    preview: '国破山河在，城春草木深。感时花溅泪，恨别鸟惊心。烽火连三月，家书抵万金。',
    image: 'https://ai-public.mastergo.com/ai/img_res/43e7125fe4023d89a1774e4416e1ace4.jpg'
  },
  {
    id: 'dufu_2',
    title: '登高',
    author: '杜甫',
    dynasty: '唐代',
    content: '风急天高猿啸哀，渚清沙白鸟飞回。无边落木萧萧下，不尽长江滚滚来。',
    preview: '风急天高猿啸哀，渚清沙白鸟飞回。无边落木萧萧下，不尽长江滚滚来。',
    image: 'https://ai-public.mastergo.com/ai/img_res/f0be731204399b0b196cea3d7505fdd2.jpg'
  },
  
  // 苏轼诗词
  {
    id: 'sushi_1',
    title: '水调歌头',
    author: '苏轼',
    dynasty: '宋代',
    content: '明月几时有？把酒问青天。不知天上宫阙，今夕是何年。我欲乘风归去，又恐琼楼玉宇，高处不胜寒。',
    preview: '明月几时有？把酒问青天。不知天上宫阙，今夕是何年。我欲乘风归去，又恐琼楼玉宇...',
    image: 'https://ai-public.mastergo.com/ai/img_res/48599143c45e1b4cb1d0cd756388f738.jpg'
  },
  {
    id: 'sushi_2',
    title: '念奴娇·赤壁怀古',
    author: '苏轼',
    dynasty: '宋代',
    content: '大江东去，浪淘尽，千古风流人物。故垒西边，人道是，三国周郎赤壁。',
    preview: '大江东去，浪淘尽，千古风流人物。故垒西边，人道是，三国周郎赤壁。',
    image: 'https://ai-public.mastergo.com/ai/img_res/437f5006c8faaf74d6d7d4197e1d9482.jpg'
  },
  
  // 其他诗人
  {
    id: 'wangwei_1',
    title: '相思',
    author: '王维',
    dynasty: '唐代',
    content: '红豆生南国，春来发几枝。愿君多采撷，此物最相思。',
    preview: '红豆生南国，春来发几枝。愿君多采撷，此物最相思。',
    image: 'https://ai-public.mastergo.com/ai/img_res/156f26c1f21f943949d6e24ce6c4e10c.jpg'
  },
  {
    id: 'baijuyi_1',
    title: '琵琶行',
    author: '白居易',
    dynasty: '唐代',
    content: '浔阳江头夜送客，枫叶荻花秋瑟瑟。主人下马客在船，举酒欲饮无管弦。',
    preview: '浔阳江头夜送客，枫叶荻花秋瑟瑟。主人下马客在船，举酒欲饮无管弦。',
    image: 'https://ai-public.mastergo.com/ai/img_res/43e7125fe4023d89a1774e4416e1ace4.jpg'
  },
  {
    id: 'lishangyin_1',
    title: '锦瑟',
    author: '李商隐',
    dynasty: '唐代',
    content: '锦瑟无端五十弦，一弦一柱思华年。庄生晓梦迷蝴蝶，望帝春心托杜鹃。',
    preview: '锦瑟无端五十弦，一弦一柱思华年。庄生晓梦迷蝴蝶，望帝春心托杜鹃。',
    image: 'https://ai-public.mastergo.com/ai/img_res/f0be731204399b0b196cea3d7505fdd2.jpg'
  },
  {
    id: 'xinqiji_1',
    title: '青玉案·元夕',
    author: '辛弃疾',
    dynasty: '宋代',
    content: '东风夜放花千树，更吹落、星如雨。宝马雕车香满路。凤箫声动，玉壶光转，一夜鱼龙舞。',
    preview: '东风夜放花千树，更吹落、星如雨。宝马雕车香满路。凤箫声动，玉壶光转...',
    image: 'https://ai-public.mastergo.com/ai/img_res/48599143c45e1b4cb1d0cd756388f738.jpg'
  },
  {
    id: 'liqingzhao_1',
    title: '声声慢',
    author: '李清照',
    dynasty: '宋代',
    content: '寻寻觅觅，冷冷清清，凄凄惨惨戚戚。乍暖还寒时候，最难将息。',
    preview: '寻寻觅觅，冷冷清清，凄凄惨惨戚戚。乍暖还寒时候，最难将息。',
    image: 'https://ai-public.mastergo.com/ai/img_res/437f5006c8faaf74d6d7d4197e1d9482.jpg'
  },
  {
    id: 'mazhiyuan_1',
    title: '天净沙·秋思',
    author: '马致远',
    dynasty: '元代',
    content: '枯藤老树昏鸦，小桥流水人家，古道西风瘦马。夕阳西下，断肠人在天涯。',
    preview: '枯藤老树昏鸦，小桥流水人家，古道西风瘦马。夕阳西下，断肠人在天涯。',
    image: 'https://ai-public.mastergo.com/ai/img_res/156f26c1f21f943949d6e24ce6c4e10c.jpg'
  },
  {
    id: 'xuzhimo_1',
    title: '再别康桥',
    author: '徐志摩',
    dynasty: '现代',
    content: '轻轻的我走了，正如我轻轻的来；我轻轻的招手，作别西天的云彩。',
    preview: '轻轻的我走了，正如我轻轻的来；我轻轻的招手，作别西天的云彩。',
    image: 'https://ai-public.mastergo.com/ai/img_res/43e7125fe4023d89a1774e4416e1ace4.jpg'
  }
]

/**
 * 在线搜索诗词
 * - 支持按标题、作者、内容关键词搜索
 * - 开发环境使用本地数据库搜索
 */
export function searchPoemsOnline(params: PoemSearchRequest, signal?: AbortSignal) {
  // 开发环境使用本地数据库搜索
  if (import.meta.env.DEV) {
    return new Promise<PoemSearchResponse>((resolve, reject) => {
      const timer = setTimeout(() => {
        const keyword = params.keyword.toLowerCase().trim()
        
        // 智能搜索逻辑
        const searchResults = poemDatabase.filter(poem => {
          // 搜索标题
          if (poem.title.toLowerCase().includes(keyword)) return true
          
          // 搜索作者
          if (poem.author.toLowerCase().includes(keyword)) return true
          
          // 搜索内容
          if (poem.content.toLowerCase().includes(keyword)) return true
          
          // 搜索朝代
          if (poem.dynasty.toLowerCase().includes(keyword)) return true
          
          return false
        })
        
        // 分页处理
        const page = params.page || 1
        const limit = params.limit || 10
        const startIndex = (page - 1) * limit
        const endIndex = startIndex + limit
        
        const paginatedResults = searchResults.slice(startIndex, endIndex)
        
        const response: PoemSearchResponse = {
          poems: paginatedResults,
          total: searchResults.length,
          page: page,
          limit: limit
        }
        
        resolve(response)
      }, 500) // 模拟网络延迟
      
      // 支持取消
      if (signal) {
        signal.addEventListener('abort', () => {
          clearTimeout(timer)
          reject(new Error('搜索已取消'))
        })
      }
    })
  }
  
  // 生产环境调用真实接口
  return http.get<PoemSearchResponse>('/poem/search', { params, signal })
}