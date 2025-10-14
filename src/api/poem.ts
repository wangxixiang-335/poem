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

/**
 * 在线搜索诗词
 * - 支持按标题、作者、内容关键词搜索
 * - 开发环境使用 Mock 数据
 */
export function searchPoemsOnline(params: PoemSearchRequest, signal?: AbortSignal) {
  // 开发环境 Mock 数据
  if (import.meta.env.DEV) {
    return new Promise<PoemSearchResponse>((resolve, reject) => {
      const timer = setTimeout(() => {
        // 模拟搜索结果，根据关键词生成相关诗词
        const mockPoems: SearchPoemItem[] = [
          {
            id: `search_${Date.now()}_1`,
            title: `望${params.keyword}`,
            author: '李白',
            dynasty: '唐代',
            content: `${params.keyword}明月出天山，苍茫云海间。
长风几万里，吹度玉门关。
汉下白登道，胡窥青海湾。
由来征战地，不见有人还。`,
            preview: `${params.keyword}明月出天山，苍茫云海间。长风几万里，吹度玉门关...`,
            image: 'https://ai-public.mastergo.com/ai/img_res/48599143c45e1b4cb1d0cd756388f738.jpg'
          },
          {
            id: `search_${Date.now()}_2`,
            title: `咏${params.keyword}`,
            author: '杜甫',
            dynasty: '唐代',
            content: `国破山河在，城春草木深。
感时花溅泪，恨别鸟惊心。
烽火连三月，家书抵万金。
白头搔更短，浑欲不胜簪。`,
            preview: `国破山河在，城春草木深。感时花溅泪，恨别鸟惊心...`,
            image: 'https://ai-public.mastergo.com/ai/img_res/437f5006c8faaf74d6d7d4197e1d9482.jpg'
          },
          {
            id: `search_${Date.now()}_3`,
            title: `${params.keyword}词`,
            author: '苏轼',
            dynasty: '宋代',
            content: `明月几时有？把酒问青天。
不知天上宫阙，今夕是何年。
我欲乘风归去，又恐琼楼玉宇，
高处不胜寒。`,
            preview: `明月几时有？把酒问青天。不知天上宫阙，今夕是何年...`,
            image: 'https://ai-public.mastergo.com/ai/img_res/156f26c1f21f943949d6e24ce6c4e10c.jpg'
          },
          {
            id: `search_${Date.now()}_4`,
            title: `${params.keyword}怀古`,
            author: '辛弃疾',
            dynasty: '宋代',
            content: `千古江山，英雄无觅孙仲谋处。
舞榭歌台，风流总被雨打风吹去。
斜阳草树，寻常巷陌，
人道寄奴曾住。`,
            preview: `千古江山，英雄无觅孙仲谋处。舞榭歌台，风流总被雨打风吹去...`,
            image: 'https://ai-public.mastergo.com/ai/img_res/43e7125fe4023d89a1774e4416e1ace4.jpg'
          },
          {
            id: `search_${Date.now()}_5`,
            title: `题${params.keyword}`,
            author: '王安石',
            dynasty: '宋代',
            content: `京口瓜洲一水间，钟山只隔数重山。
春风又绿江南岸，明月何时照我还？
不畏浮云遮望眼，自缘身在最高层。`,
            preview: `京口瓜洲一水间，钟山只隔数重山。春风又绿江南岸，明月何时照我还...`,
            image: 'https://ai-public.mastergo.com/ai/img_res/f0be731204399b0b196cea3d7505fdd2.jpg'
          }
        ]

        const response: PoemSearchResponse = {
          poems: mockPoems.slice(0, params.limit || 10),
          total: mockPoems.length,
          page: params.page || 1,
          limit: params.limit || 10
        }
        
        resolve(response)
      }, 800) // 模拟网络延迟
      
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