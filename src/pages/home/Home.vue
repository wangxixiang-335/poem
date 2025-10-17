<template>
  <div class="page">
    <!-- 顶部导航栏 + 搜索 -->
    <div class="header">
      <button class="icon-btn" @click="goBack" aria-label="返回">←</button>
      <div class="title">诗词鉴赏</div>
      <div class="header-actions">
        <button class="icon-btn" @click="toggleSearch" aria-label="搜索">🔍</button>
        <div class="user-info">
          <span class="username">👤 {{ authStore.user?.username }}</span>
          <button class="logout-btn" @click="handleLogout" title="退出登录">退出</button>
        </div>
      </div>
    </div>
    <div class="search-bar" v-if="showSearch">
      <input
        v-model="searchQuery"
        type="text"
        class="search-input"
        placeholder="搜索：标题/作者/朝代/内容"
        @keydown.esc="showSearch=false"
        aria-label="搜索输入"
      />
      <button class="search-clear" @click="clearSearch">清空</button>
      <button class="online-search-btn" @click="showOnlineSearch = true">在线搜索</button>
    </div>

    <!-- 轮播图区域（scroll-snap 横向滑动） -->
    <div
      class="carousel"
      @mouseenter="pauseCarousel"
      @mouseleave="resumeCarousel"
      @keydown.left.prevent="prevSlide"
      @keydown.right.prevent="nextSlide"
      tabindex="0"
      aria-label="轮播图"
    >
      <div class="carousel-track" ref="carouselTrack">
        <div class="carousel-item" v-for="(item, index) in carouselItems" :key="index">
          <img :src="item.image" class="carousel-image" alt="轮播图片" />
          <div class="carousel-text">
            <div class="poem-line">{{ item.line }}</div>
            <div class="author">{{ item.author }}</div>
          </div>
        </div>
      </div>
      <div class="dots">
        <button
          v-for="(item, idx) in carouselItems"
          :key="idx"
          :class="['dot', { active: idx === activeSlide }]"
          @click="jumpSlide(idx)"
          :aria-label="`跳转到第${idx+1}张`"
        />
      </div>
    </div>

    <!-- 分类导航标签 -->
    <div class="category-scroll" role="tablist" aria-label="分类导航">
      <div class="category-container">
        <button
          v-for="(category, index) in categories"
          :key="index"
          class="category-item"
          :class="{ active: activeCategory === index }"
          @click="selectCategory(index)"
          role="tab"
          :aria-selected="activeCategory === index"
          :title="category.description"
        >
          {{ category.icon }} {{ category.name }}
        </button>
      </div>
    </div>

    <!-- 状态提示 -->
    <div class="status-bar" v-if="!isServerConnected">
      <div class="status-warning">
        ⚠️ 数据库未连接，当前使用本地数据
      </div>
    </div>
    
    <!-- 加载状态 -->
    <div class="loading-overlay" v-if="isLoading">
      <div class="loading-content">
        <div class="spinner"></div>
        <p>正在加载诗词...</p>
      </div>
    </div>

    <!-- 主内容区域：根据底部标签切换 -->
    <div class="content-list">
      <!-- 首页：热门诗词列表（支持搜索/分类/收藏） -->
      <template v-if="activeFooter === 0">
        <div
          class="poem-card"
          v-for="(poem, index) in filteredPoems"
          :key="index"
          @click="viewPoemDetail(poem)"
          :aria-label="`查看诗词：${poem.title}`"
        >
          <img :src="poem.image" class="poem-image" :alt="poem.title" />
          <div class="poem-info">
            <div class="poem-title">
              {{ poem.title }}
              <div class="poem-actions">
                <button
                  class="fav-btn"
                  :aria-pressed="isFav(poem)"
                  @click.stop="toggleFav(poem)"
                  :title="isFav(poem) ? '取消收藏' : '收藏'"
                >
                  {{ isFav(poem) ? '💛' : '🤍' }}
                </button>
                <button
                  class="delete-btn"
                  @click.stop="deletePoem(poem)"
                  :title="'删除诗词'"
                  v-if="isServerConnected"
                >
                  🗑️
                </button>
              </div>
            </div>
            <div class="poem-author">{{ poem.author }} · {{ poem.dynasty }}</div>
            <div class="poem-preview">{{ poem.preview }}</div>
          </div>
        </div>
        <div v-if="filteredPoems.length === 0" class="empty">未找到相关诗词</div>
      </template>

      <!-- 分类页：展示所有分类并说明 -->
      <template v-else-if="activeFooter === 1">
        <div class="category-panel">
          <h3>诗词分类</h3>
          <div class="category-grid">
            <div 
              v-for="(c, i) in categories" 
              :key="i" 
              class="category-card"
              @click="viewCategoryPoems(i)"
            >
              <div class="category-icon">{{ c.icon }}</div>
              <div class="category-info">
                <h4>{{ c.name }}</h4>
                <p class="category-count">{{ categoryCounts[c.name] }} 首</p>
                <p class="category-desc">{{ c.description }}</p>
              </div>
            </div>
          </div>
          <p class="hint">点击分类卡片，将直接跳转到对应分类的诗词页面；右上角可搜索标题/作者/朝代/内容。</p>
        </div>
      </template>

      <!-- 收藏页：仅展示收藏的诗词 -->
      <template v-else-if="activeFooter === 2">
        <div
          class="poem-card"
          v-for="(poem, index) in favList"
          :key="index"
          @click="viewPoemDetail(poem)"
        >
          <img :src="poem.image" class="poem-image" :alt="poem.title" />
          <div class="poem-info">
            <div class="poem-title">
              {{ poem.title }}
              <div class="poem-actions">
                <button class="fav-btn" @click.stop="toggleFav(poem)">💛</button>
                <button
                  class="delete-btn"
                  @click.stop="deletePoem(poem)"
                  :title="'删除诗词'"
                  v-if="isServerConnected"
                >
                  🗑️
                </button>
              </div>
            </div>
            <div class="poem-author">{{ poem.author }} · {{ poem.dynasty }}</div>
            <div class="poem-preview">{{ poem.preview }}</div>
          </div>
        </div>
        <div v-if="favList.length === 0" class="empty">还没有收藏的诗词</div>
      </template>

      <!-- 我的页：个人中心 -->
      <template v-else>
        <div class="profile-panel">
          <!-- 用户信息卡片 -->
          <div class="user-card">
            <div class="user-avatar">📚</div>
            <div class="user-info">
              <h3>{{ authStore.isAuthenticated ? authStore.user?.username : '诗词爱好者' }}</h3>
              <p class="user-desc">
                {{ authStore.isAuthenticated ? '欢迎回来！' : '请先登录以使用完整功能' }}
                <span v-if="totalCount > 0">已收录 {{ totalCount }} 首诗词</span>
              </p>
            </div>
          </div>

          <!-- 已登录用户专属内容 -->
          <template v-if="authStore.isAuthenticated">
            <!-- 数据统计卡片 -->
            <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">📖</div>
              <div class="stat-info">
                <div class="stat-number">{{ totalCount }}</div>
                <div class="stat-label">诗词总数</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">❤️</div>
              <div class="stat-info">
                <div class="stat-number">{{ favoritesCount }}</div>
                <div class="stat-label">收藏数量</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">🏷️</div>
              <div class="stat-info">
                <div class="stat-number">{{ Object.keys(categoryCounts).length }}</div>
                <div class="stat-label">分类数量</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">📊</div>
              <div class="stat-info">
                <div class="stat-number">{{ Math.round(favoritesCount / totalCount * 100) || 0 }}%</div>
                <div class="stat-label">收藏比例</div>
              </div>
            </div>
          </div>

          <!-- 分类分布图表 -->
          <div class="chart-section">
            <h4>📈 分类分布</h4>
            <div class="chart-container">
              <div 
                v-for="(c, i) in categories" 
                :key="i" 
                class="chart-bar"
                :style="{ width: `${(categoryCounts[c.name] / totalCount * 100) || 0}%` }"
                :title="`${c.name}: ${categoryCounts[c.name]} 首`"
              >
                <span class="chart-label">{{ c.icon }} {{ c.name }}</span>
                <span class="chart-count">{{ categoryCounts[c.name] }}</span>
              </div>
            </div>
          </div>

          <!-- 热门朝代 -->
          <div class="dynasty-section">
            <h4>🏛️ 热门朝代</h4>
            <div class="dynasty-tags">
              <span 
                v-for="(dynasty, index) in topDynasties" 
                :key="index"
                class="dynasty-tag"
                :class="{ 'top-dynasty': index < 3 }"
              >
                {{ dynasty.dynasty }} ({{ dynasty.count }})
              </span>
            </div>
          </div>

          <!-- 快速操作 -->
          <div class="quick-actions">
            <h4>⚡ 快速操作</h4>
            <div class="action-buttons">
              <button class="action-btn" @click="exportData">
                📥 导出数据
              </button>
              <button class="action-btn" @click="clearAllFavorites">
                🗑️ 清空收藏
              </button>
              <button class="action-btn" @click="refreshData">
                🔄 刷新数据
              </button>
            </div>
            </div>
          </template>
        </div>
      </template>
    </div>

    <!-- 底部导航栏 -->
    <div class="footer" role="tablist" aria-label="底部导航">
      <div
        class="footer-item"
        v-for="(item, index) in footerItems"
        :key="index"
        :class="{ active: activeFooter === index }"
        @click="switchTab(index)"
        role="tab"
        :aria-selected="activeFooter === index"
      >
        <div class="footer-icon">{{ item.icon }}</div>
        <div class="footer-text" :style="{ color: activeFooter === index ? '#c9a76f' : '#999' }">
          {{ item.text }}
        </div>
      </div>
    </div>

    <!-- 详情模态框 -->
    <div class="modal-mask" v-if="showDetail" @click.self="closeDetail" aria-modal="true" role="dialog">
      <div class="modal">
        <div class="modal-header">
          <h4>{{ selectedPoem?.title }}</h4>
          <div class="modal-actions">
            <button class="action-btn" @click="fetchAppreciation" :disabled="appreciationLoading">
              {{ appreciationLoading ? '鉴赏中…' : '智能鉴赏' }}
            </button>
            <button class="icon-btn" @click="closeDetail" aria-label="关闭">✖</button>
          </div>
        </div>
        <div class="modal-body">
          <img :src="selectedPoem?.image" class="modal-image" :alt="selectedPoem?.title" />
          <p class="modal-author">{{ selectedPoem?.author }} · {{ selectedPoem?.dynasty }}</p>
          <p class="modal-preview">{{ selectedPoem?.preview }}</p>

          <div class="appreciation" v-if="appreciation || appreciationLoading || appreciationError">
            <h5>诗词鉴赏</h5>
            <div v-if="appreciationLoading" class="loading">正在解析诗词意境与修辞…</div>
            <div v-else-if="appreciationError" class="error">{{ appreciationError }}</div>
            <template v-else-if="appreciation">
              <section class="block">
                <div class="block-title">意境与情感</div>
                <p class="block-content">{{ appreciation.mood }}</p>
              </section>
              <section class="block">
                <div class="block-title">修辞与技巧</div>
                <p class="block-content">{{ appreciation.rhetoric }}</p>
              </section>
              <section class="block">
                <div class="block-title">创作背景</div>
                <p class="block-content">{{ appreciation.background }}</p>
              </section>
              <section class="block">
                <div class="block-title">综合点评</div>
                <p class="block-content">{{ appreciation.commentary }}</p>
              </section>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- 在线搜索组件 -->
    <OnlineSearch 
      :show="showOnlineSearch" 
      @close="showOnlineSearch = false"
      @add-poems="handleAddPoems"
    />


  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { analyzePoem, type AnalysisResult, type SearchPoemItem } from '../../api/poem'
import { PoemAPI, type Poem as DatabasePoem } from '../../api/poemDatabase'
import OnlineSearch from '../../components/OnlineSearch.vue'
import { useAuthStore } from '../../stores/auth'

// 用户认证状态
const authStore = useAuthStore()
const router = useRouter()

// 退出登录
const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

/* 轮播数据 */
const carouselItems = ref([
  {
    image: 'https://ai-public.mastergo.com/ai/img_res/23776e3560960f7d99c31016d8ac9358.jpg',
    line: '山重水复疑无路，柳暗花明又一村。',
    author: '陆游《游山西村》'
  },
  {
    image: 'https://ai-public.mastergo.com/ai/img_res/e2b49700f4f05ac9961717d8205941f6.jpg',
    line: '大江东去，浪淘尽，千古风流人物。',
    author: '苏轼《念奴娇·赤壁怀古》'
  },
  {
    image: 'https://ai-public.mastergo.com/ai/img_res/506bd9ac37829c9464c75b316c4224db.jpg',
    line: '举头望明月，低头思故乡。',
    author: '李白《静夜思》'
  }
])

/* 分类与数据 */
const categories = ref([
  { name: '唐诗', description: '唐代诗歌，格律严谨，意境深远', icon: '📜' },
  { name: '宋词', description: '宋代词牌，婉约豪放，音律优美', icon: '🎵' },
  { name: '元曲', description: '元代散曲，通俗易懂，富有生活气息', icon: '🎭' },
  { name: '古风', description: '古代风格诗歌，包括汉魏六朝作品', icon: '🏛️' },
  { name: '现代诗', description: '现当代诗歌，形式自由，情感真挚', icon: '🆕' },
  { name: '乐府', description: '汉魏乐府诗，民间歌谣，叙事性强', icon: '🎶' },
  { name: '绝句', description: '四句诗体，言简意赅，意境完整', icon: '✂️' },
  { name: '律诗', description: '八句诗体，对仗工整，格律严谨', icon: '⚖️' }
])
const activeCategory = ref(0)

type Poem = DatabasePoem

// 数据库连接状态
const isServerConnected = ref(false)
const isLoading = ref(true)
const errorMessage = ref<string | null>(null)

// 诗词列表
const poems = ref<Poem[]>([])

// 从数据库加载诗词列表
const loadPoemsFromDatabase = async (): Promise<void> => {
  try {
    console.log('🔄 开始加载诗词数据...')
    isLoading.value = true
    errorMessage.value = null
    
    // 检查服务器连接
    console.log('🔍 检查服务器连接...')
    const connected = await PoemAPI.checkConnection()
    console.log('🔗 服务器连接状态:', connected)
    
    // 获取诗词列表
    console.log('📚 从数据库获取诗词列表...')
    const poemList = await PoemAPI.getAll()
    console.log('✅ 获取到诗词数据:', poemList.length, '首')
    console.log('📋 诗词列表:', poemList)
    poems.value = poemList
    
    // 如果成功获取到数据，说明数据库连接正常
    isServerConnected.value = true
    
    // 如果数据库为空，插入默认数据
    if (poemList.length === 0) {
      console.log('📝 数据库为空，初始化默认数据...')
      await initializeDefaultPoems()
    }
    
    console.log('🎉 诗词数据加载完成!')
  } catch (error: any) {
    console.error('❌ 加载诗词失败:', error)
    errorMessage.value = error.message || '加载诗词失败'
    
    // 如果数据库连接失败，使用本地默认数据
    console.log('🔄 使用本地默认数据')
    isServerConnected.value = false
    poems.value = getDefaultPoems()
  } finally {
    isLoading.value = false
  }
}

// 获取默认诗词数据
const getDefaultPoems = (): Poem[] => [
  // 唐诗
  {
    title: '静夜思',
    author: '李白',
    dynasty: '唐代',
    content: '床前明月光，疑是地上霜。举头望明月，低头思故乡。',
    preview: '床前明月光，疑是地上霜。举头望明月，低头思故乡。',
    image: 'https://ai-public.mastergo.com/ai/img_res/48599143c45e1b4cb1d0cd756388f738.jpg',
    is_favorite: false
  },
  {
    title: '春晓',
    author: '孟浩然',
    dynasty: '唐代',
    content: '春眠不觉晓，处处闻啼鸟。夜来风雨声，花落知多少。',
    preview: '春眠不觉晓，处处闻啼鸟。夜来风雨声，花落知多少。',
    image: 'https://ai-public.mastergo.com/ai/img_res/437f5006c8faaf74d6d7d4197e1d9482.jpg',
    is_favorite: false
  },
  {
    title: '登鹳雀楼',
    author: '王之涣',
    dynasty: '唐代',
    content: '白日依山尽，黄河入海流。欲穷千里目，更上一层楼。',
    preview: '白日依山尽，黄河入海流。欲穷千里目，更上一层楼。',
    image: 'https://ai-public.mastergo.com/ai/img_res/43e7125fe4023d89a1774e4416e1ace4.jpg',
    is_favorite: false
  },
  {
    title: '江雪',
    author: '柳宗元',
    dynasty: '唐代',
    content: '千山鸟飞绝，万径人踪灭。孤舟蓑笠翁，独钓寒江雪。',
    preview: '千山鸟飞绝，万径人踪灭。孤舟蓑笠翁，独钓寒江雪。',
    image: 'https://ai-public.mastergo.com/ai/img_res/f0be731204399b0b196cea3d7505fdd2.jpg',
    is_favorite: false
  },
  
  // 宋词
  {
    title: '水调歌头',
    author: '苏轼',
    dynasty: '宋代',
    content: '明月几时有？把酒问青天。不知天上宫阙，今夕是何年。',
    preview: '明月几时有？把酒问青天。不知天上宫阙，今夕是何年。',
    image: 'https://ai-public.mastergo.com/ai/img_res/156f26c1f21f943949d6e24ce6c4e10c.jpg',
    is_favorite: false
  },
  {
    title: '声声慢',
    author: '李清照',
    dynasty: '宋代',
    content: '寻寻觅觅，冷冷清清，凄凄惨惨戚戚。乍暖还寒时候，最难将息。',
    preview: '寻寻觅觅，冷冷清清，凄凄惨惨戚戚。乍暖还寒时候，最难将息。',
    image: 'https://ai-public.mastergo.com/ai/img_res/156f26c1f21f943949d6e24ce6c4e10c.jpg',
    is_favorite: false
  },
  
  // 元曲
  {
    title: '天净沙·秋思',
    author: '马致远',
    dynasty: '元代',
    content: '枯藤老树昏鸦，小桥流水人家，古道西风瘦马。夕阳西下，断肠人在天涯。',
    preview: '枯藤老树昏鸦，小桥流水人家，古道西风瘦马。夕阳西下，断肠人在天涯。',
    image: 'https://ai-public.mastergo.com/ai/img_res/156f26c1f21f943949d6e24ce6c4e10c.jpg',
    is_favorite: false
  },
  
  // 古风（汉代）
  {
    title: '上邪',
    author: '佚名',
    dynasty: '汉代',
    content: '上邪！我欲与君相知，长命无绝衰。山无陵，江水为竭，冬雷震震，夏雨雪，天地合，乃敢与君绝！',
    preview: '上邪！我欲与君相知，长命无绝衰。山无陵，江水为竭，冬雷震震，夏雨雪，天地合，乃敢与君绝！',
    image: 'https://ai-public.mastergo.com/ai/img_res/48599143c45e1b4cb1d0cd756388f738.jpg',
    is_favorite: false
  },
  
  // 现代诗
  {
    title: '再别康桥',
    author: '徐志摩',
    dynasty: '现代',
    content: '轻轻的我走了，正如我轻轻的来；我轻轻的招手，作别西天的云彩。',
    preview: '轻轻的我走了，正如我轻轻的来；我轻轻的招手，作别西天的云彩。',
    image: 'https://ai-public.mastergo.com/ai/img_res/437f5006c8faaf74d6d7d4197e1d9482.jpg',
    is_favorite: false
  },
  
  // 乐府诗
  {
    title: '长歌行',
    author: '佚名',
    dynasty: '汉代',
    content: '青青园中葵，朝露待日晞。阳春布德泽，万物生光辉。常恐秋节至，焜黄华叶衰。百川东到海，何时复西归？少壮不努力，老大徒伤悲！',
    preview: '青青园中葵，朝露待日晞。阳春布德泽，万物生光辉。常恐秋节至，焜黄华叶衰。百川东到海，何时复西归？少壮不努力，老大徒伤悲！',
    image: 'https://ai-public.mastergo.com/ai/img_res/43e7125fe4023d89a1774e4416e1ace4.jpg',
    is_favorite: false
  },
  
  // 绝句（四句诗）
  {
    title: '相思',
    author: '王维',
    dynasty: '唐代',
    content: '红豆生南国，春来发几枝。愿君多采撷，此物最相思。',
    preview: '红豆生南国，春来发几枝。愿君多采撷，此物最相思。',
    image: 'https://ai-public.mastergo.com/ai/img_res/f0be731204399b0b196cea3d7505fdd2.jpg',
    is_favorite: false
  },
  
  // 律诗（八句诗）
  {
    title: '望岳',
    author: '杜甫',
    dynasty: '唐代',
    content: '岱宗夫如何？齐鲁青未了。造化钟神秀，阴阳割昏晓。荡胸生曾云，决眦入归鸟。会当凌绝顶，一览众山小。',
    preview: '岱宗夫如何？齐鲁青未了。造化钟神秀，阴阳割昏晓。荡胸生曾云，决眦入归鸟。会当凌绝顶，一览众山小。',
    image: 'https://ai-public.mastergo.com/ai/img_res/48599143c45e1b4cb1d0cd756388f738.jpg',
    is_favorite: false
  }
]

// 初始化默认诗词
const initializeDefaultPoems = async (): Promise<void> => {
  try {
    const defaultPoems = getDefaultPoems()
    const createdPoems = await PoemAPI.createBatch(defaultPoems)
    poems.value = createdPoems
    console.log('默认诗词初始化完成')
  } catch (error: any) {
    console.error('初始化默认诗词失败:', error)
    throw error
  }
}

/* 在线搜索状态 */
const showOnlineSearch = ref(false)

/* 在线搜索方法 */
const handleAddPoems = async (newPoems: SearchPoemItem[]): Promise<void> => {
  try {
    const existingTitles = new Set(poems.value.map(p => `${p.title}-${p.author}`))
    const uniquePoems = newPoems.filter(p => !existingTitles.has(`${p.title}-${p.author}`))
    
    if (uniquePoems.length > 0) {
      const convertedPoems = uniquePoems.map(p => ({
        title: p.title,
        author: p.author,
        dynasty: p.dynasty,
        content: p.content || p.preview,
        preview: p.preview || p.content,
        image: p.image || 'https://ai-public.mastergo.com/ai/img_res/48599143c45e1b4cb1d0cd756388f738.jpg',
        is_favorite: false
      }))
      
      if (isServerConnected.value) {
        // 保存到数据库
        const createdPoems = await PoemAPI.createBatch(convertedPoems)
        poems.value = [...poems.value, ...createdPoems]
      } else {
        // 如果服务器未连接，只添加到本地数组
        poems.value = [...poems.value, ...convertedPoems]
      }
      
      alert(`成功添加 ${uniquePoems.length} 首诗词！`)
      showOnlineSearch.value = false
    } else {
      alert('所选诗词已存在，未添加重复内容。')
    }
  } catch (error: any) {
    console.error('添加诗词失败:', error)
    alert(`添加诗词失败: ${error.message}`)
  }
}



/* 鉴赏状态与方法 */
const appreciationLoading = ref(false)
const appreciationError = ref<string | null>(null)
const appreciation = ref<AnalysisResult | null>(null)
let appreciationAbort: AbortController | null = null

const fetchAppreciation = async () => {
  if (!selectedPoem.value) return
  appreciationLoading.value = true
  appreciationError.value = null
  appreciation.value = null
  appreciationAbort?.abort()
  appreciationAbort = new AbortController()
  try {
    const res = await analyzePoem(
      {
        title: selectedPoem.value.title,
        author: selectedPoem.value.author,
        dynasty: selectedPoem.value.dynasty,
        content: selectedPoem.value.content || selectedPoem.value.preview || ''
      },
      appreciationAbort.signal
    )
    appreciation.value = res as AnalysisResult
  } catch (e: any) {
    appreciationError.value = e?.message || '鉴赏失败，请稍后重试'
  } finally {
    appreciationLoading.value = false
  }
}

/* 搜索与筛选 */
const showSearch = ref(false)
const searchQuery = ref('')
const toggleSearch = () => (showSearch.value = !showSearch.value)
const clearSearch = () => (searchQuery.value = '')
// 分类筛选逻辑
const getFilteredPoemsByCategory = (category: string, poems: Poem[]): Poem[] => {
  switch (category) {
    case '唐诗':
      return poems.filter(p => p.dynasty.includes('唐'))
    case '宋词':
      return poems.filter(p => p.dynasty.includes('宋'))
    case '元曲':
      return poems.filter(p => p.dynasty.includes('元'))
    case '古风':
      // 古风包括唐代及以前的诗词
      return poems.filter(p => p.dynasty.includes('唐') || p.dynasty.includes('汉') || p.dynasty.includes('魏晋') || p.dynasty.includes('先秦'))
    case '现代诗':
      // 现代诗包括民国及以后的诗词
      return poems.filter(p => p.dynasty.includes('现代') || p.dynasty.includes('当代') || p.dynasty.includes('民国'))
    case '乐府':
      // 乐府诗主要是汉魏六朝时期的诗歌
      return poems.filter(p => p.dynasty.includes('汉') || p.dynasty.includes('魏晋') || p.dynasty.includes('南北朝'))
    case '绝句':
      // 绝句是四句诗，通过内容判断
      return poems.filter(p => {
        const lines = (p.content || p.preview).split(/[，。；！？]/).filter(line => line.trim())
        return lines.length === 4
      })
    case '律诗':
      // 律诗是八句诗，通过内容判断
      return poems.filter(p => {
        const lines = (p.content || p.preview).split(/[，。；！？]/).filter(line => line.trim())
        return lines.length === 8
      })
    default:
      return poems
  }
}

const filteredPoems = computed(() => {
  const q = searchQuery.value.trim()
  const currentCategory = categories.value[activeCategory.value]
  
  // 先按分类筛选
  let filtered = getFilteredPoemsByCategory(currentCategory.name, poems.value)
  
  // 再按搜索关键词筛选
  if (q) {
    filtered = filtered.filter((p) => {
      return [p.title, p.author, p.dynasty, p.preview || p.content].some((t) => 
        t?.toLowerCase().includes(q.toLowerCase())
      )
    })
  }
  
  return filtered
})

// 统计信息
const totalCount = computed(() => poems.value.length)
const favoritesCount = computed(() => poems.value.filter((p) => Boolean(p.is_favorite)).length)
const categoryCounts = computed<Record<string, number>>(() => {
  const map: Record<string, number> = {}
  categories.value.forEach((c) => {
    map[c.name] = getFilteredPoemsByCategory(c.name, poems.value).length
  })
  return map
})

// 热门朝代统计
const topDynasties = computed(() => {
  const dynastyMap: Record<string, number> = {}
  poems.value.forEach(poem => {
    dynastyMap[poem.dynasty] = (dynastyMap[poem.dynasty] || 0) + 1
  })
  
  return Object.entries(dynastyMap)
    .map(([dynasty, count]) => ({ dynasty, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5) // 只显示前5个热门朝代
})

// 快速操作方法
const exportData = () => {
  const data = {
    poems: poems.value,
    favorites: favList.value,
    stats: {
      totalCount: totalCount.value,
      favoritesCount: favoritesCount.value,
      categoryCounts: categoryCounts.value,
      topDynasties: topDynasties.value
    },
    exportTime: new Date().toISOString()
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `poem-data-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
  
  alert('数据导出成功！')
}

const clearAllFavorites = async () => {
  if (!confirm('确定要清空所有收藏吗？此操作不可撤销。')) {
    return
  }
  
  try {
    if (isServerConnected.value) {
      // 批量取消收藏
      const favPoems = poems.value.filter(p => p.is_favorite && p.id)
      for (const poem of favPoems) {
        await PoemAPI.toggleFavorite(poem.id!)
      }
    } else {
      // 本地模式：直接更新状态
      poems.value.forEach(poem => {
        poem.is_favorite = false
      })
    }
    
    alert('收藏已清空！')
  } catch (error: any) {
    console.error('清空收藏失败:', error)
    alert(`清空收藏失败: ${error.message}`)
  }
}

const refreshData = async () => {
  await loadPoemsFromDatabase()
  alert('数据刷新完成！')
}

/* 收藏 */
const isFav = (p: Poem) => Boolean(p.is_favorite)
const toggleFav = async (p: Poem): Promise<void> => {
  try {
    if (isServerConnected.value && p.id) {
      // 通过API切换收藏状态
      const updatedPoem = await PoemAPI.toggleFavorite(p.id)
      
      // 更新本地数据
      const index = poems.value.findIndex(poem => poem.id === p.id)
      if (index !== -1) {
        poems.value[index] = {
          ...poems.value[index],
          ...updatedPoem,
          is_favorite: Boolean(updatedPoem.is_favorite)
        }
      }
    } else {
      // 如果服务器未连接，只更新本地状态
      const index = poems.value.findIndex(poem => poem.title === p.title && poem.author === p.author)
      if (index !== -1) {
        poems.value[index].is_favorite = !poems.value[index].is_favorite
      }
    }
  } catch (error: any) {
    console.error('切换收藏状态失败:', error)
    alert(`操作失败: ${error.message}`)
  }
}
const favList = computed(() => poems.value.filter((p) => isFav(p)))

/* 删除诗词 */
const deletePoem = async (poem: Poem): Promise<void> => {
  if (!confirm(`确定要删除诗词《${poem.title}》吗？`)) {
    return
  }
  
  try {
    if (isServerConnected.value && poem.id) {
      // 通过API删除诗词
      await PoemAPI.delete(poem.id)
    }
    
    // 从本地数组中移除
    const index = poems.value.findIndex(p => 
      poem.id ? p.id === poem.id : (p.title === poem.title && p.author === poem.author)
    )
    if (index !== -1) {
      poems.value.splice(index, 1)
    }
    
    alert('诗词删除成功！')
  } catch (error: any) {
    console.error('删除诗词失败:', error)
    alert(`删除失败: ${error.message}`)
  }
}

/* 页面切换 */
const footerItems = ref([
  { icon: '🏠', text: '首页' },
  { icon: '📚', text: '分类' },
  { icon: '❤️', text: '收藏' },
  { icon: '👤', text: '我的' }
])
const activeFooter = ref(0)
const switchTab = (index: number) => (activeFooter.value = index)



/* 交互方法 */
const goBack = () => window.history.length > 1 ? window.history.back() : alert('没有上一页')
const selectCategory = (index: number) => (activeCategory.value = index)

// 查看分类诗词
const viewCategoryPoems = (index: number) => {
  // 切换到首页
  activeFooter.value = 0
  // 选择对应分类
  activeCategory.value = index
  // 滚动到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
const selectedPoem = ref<Poem | null>(null)
const showDetail = ref(false)
const viewPoemDetail = (poem: Poem) => {
  selectedPoem.value = poem
  showDetail.value = true
  // 打开详情时清空鉴赏结果与错误
  appreciation.value = null
  appreciationError.value = null
}
const closeDetail = () => {
  showDetail.value = false
  selectedPoem.value = null
  // 关闭详情时取消鉴赏请求
  if (appreciationAbort) {
    appreciationAbort.abort()
    appreciationAbort = null
  }
}

/* 轮播控制 */
const activeSlide = ref(0)
const carouselTrack = ref<HTMLDivElement | null>(null)
let timer: number | null = null
const jumpSlide = (idx: number) => {
  activeSlide.value = idx
  const child = carouselTrack.value?.children.item(idx) as HTMLElement | null
  child?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
}
const nextSlide = () => jumpSlide((activeSlide.value + 1) % carouselItems.value.length)
const prevSlide = () => jumpSlide((activeSlide.value - 1 + carouselItems.value.length) % carouselItems.value.length)
const startAuto = () => {
  timer = window.setInterval(nextSlide, 5000)
}
const pauseCarousel = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}
const resumeCarousel = () => {
  if (!timer) startAuto()
}

onMounted(async () => {
  startAuto()
  await loadPoemsFromDatabase()
})
onBeforeUnmount(() => {
  pauseCarousel()
})
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f8f4ed;
  font-family: 'Microsoft YaHei', sans-serif;
}

/* 顶部 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #fff;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.icon-btn {
  background: transparent;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.icon-btn:hover {
  background: rgba(0, 0, 0, 0.1);
}

.auth-btn {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.auth-btn:hover {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  transform: translateY(-1px);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.username {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.logout-btn {
  background: #f3f4f6;
  color: #6b7280;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.logout-btn:hover {
  background: #e5e7eb;
  color: #374151;
}

.title {
  font-size: 22px;
  font-weight: bold;
  color: #333;
  font-family: 'STXingkai', 'KaiTi', serif;
}

/* 搜索 */
.search-bar {
  display: flex;
  gap: 8px;
  padding: 8px 12px;
  background: #fff;
  border-bottom: 1px solid #eee;
}
.search-input {
  flex: 1;
  padding: 8px 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
}
.search-clear {
  padding: 8px 12px;
  border: 1px solid #ddd;
  background: #fafafa;
  border-radius: 6px;
  cursor: pointer;
}
.online-search-btn {
  padding: 8px 12px;
  border: 1px solid #c9a76f;
  background: #c9a76f;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}
.online-search-btn:hover {
  background: #b8956a;
}

/* 状态提示 */
.status-bar {
  padding: 8px 16px;
  background: #fff3cd;
  border-bottom: 1px solid #ffeaa7;
}
.status-warning {
  font-size: 14px;
  color: #856404;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 加载状态 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.loading-content {
  background: white;
  padding: 24px;
  border-radius: 8px;
  text-align: center;
}
.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #c9a76f;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 轮播 */
.carousel {
  width: 100%;
  height: 200px;
  overflow: hidden;
  flex-shrink: 0;
  position: relative;
  background: #0001;
  outline: none;
}
.carousel-track {
  display: flex;
  gap: 0;
  width: 100%;
  height: 100%;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
}
.carousel-item {
  position: relative;
  width: 100%;
  height: 100%;
  flex: 0 0 100%;
  scroll-snap-align: center;
}
.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.carousel-text {
  position: absolute;
  bottom: 16px;
  left: 16px;
  right: 16px;
  background-color: rgba(0, 0, 0, 0.4);
  padding: 12px;
  border-radius: 8px;
}
.poem-line {
  font-size: 18px;
  color: #fff;
  font-weight: bold;
  margin-bottom: 6px;
}
.author {
  font-size: 14px;
  color: #e0e0e0;
}
.dots {
  position: absolute;
  bottom: 8px;
  left: 0;
  right: 0;
  display: flex;
  gap: 6px;
  justify-content: center;
}
.dot {
  width: 10px;
  height: 10px;
  background: #fff8;
  border-radius: 50%;
  border: none;
  cursor: pointer;
}
.dot.active {
  background: #fff;
}

/* 分类导航 */
.category-scroll {
  white-space: nowrap;
  padding: 16px 0;
  background-color: #fff;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
  overflow-x: auto;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}
.category-scroll::-webkit-scrollbar {
  display: none; /* Chrome, Safari and Opera */
}
.category-container {
  display: inline-block;
  padding: 0 16px;
}
.category-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  margin-right: 8px;
  background-color: #f8f8f8;
  border-radius: 20px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  border: none;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.category-item:hover {
  background-color: #e8e8e8;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}
.category-item.active {
  background: linear-gradient(135deg, #c9a76f, #b8956a);
  color: #fff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(201, 167, 111, 0.3);
}

/* 内容列表 */
.content-list {
  flex: 1;
  padding: 12px;
}
.poem-card {
  display: flex;
  background-color: #fff;
  border-radius: 10px;
  padding: 14px;
  margin-bottom: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  cursor: pointer;
}
.poem-image {
  width: 96px;
  height: 96px;
  border-radius: 8px;
  margin-right: 14px;
  flex-shrink: 0;
  object-fit: cover;
}
.poem-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.poem-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.poem-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}
.fav-btn, .delete-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 18px;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s;
}
.fav-btn:hover, .delete-btn:hover {
  background: rgba(0, 0, 0, 0.1);
}
.delete-btn {
  color: #dc3545;
}
.poem-author {
  font-size: 14px;
  color: #999;
}
.poem-preview {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}
.empty {
  padding: 24px;
  text-align: center;
  color: #999;
}

/* 分类面板 / 我的面板 */
.category-panel, .profile-panel {
  background: #fff;
  border-radius: 10px;
  padding: 16px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
}

/* 用户认证相关样式 */
.auth-prompt {
  margin-top: 12px;
}

.login-prompt-btn {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.login-prompt-btn:hover {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  transform: translateY(-1px);
}

.guest-notice {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
}

.guest-notice h4 {
  margin: 0 0 12px 0;
  color: #495057;
  font-size: 16px;
}

.guest-notice ul {
  margin: 0;
  padding-left: 20px;
  color: #6c757d;
}

.guest-notice li {
  margin-bottom: 6px;
  font-size: 14px;
}

/* 分类网格布局 */
.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

/* 分类卡片样式 */
.category-card {
  background: linear-gradient(135deg, #f8f4ed, #fff);
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #e8e4dc;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.category-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  border-color: #c9a76f;
}

.category-icon {
  font-size: 32px;
  margin-bottom: 12px;
  text-align: center;
}

.category-info h4 {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin: 0 0 8px 0;
}

.category-count {
  font-size: 14px;
  color: #c9a76f;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.category-desc {
  font-size: 12px;
  color: #666;
  line-height: 1.4;
  margin: 0;
}

.link {
  background: none;
  border: none;
  color: #c9a76f;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  text-align: left;
  width: 100%;
  padding: 8px 0;
}

/* 底部导航 */
.footer {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 10px 0;
  background-color: #fff;
  box-shadow: 0 -4px 10px rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
  position: sticky;
  bottom: 0;
}
.footer-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.footer-item.active .footer-icon {
  color: #c9a76f;
}
.footer-icon {
  font-size: 18px;
}
.footer-text {
  font-size: 12px;
  margin-top: 6px;
}

/* 模态框 */
.modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}
.modal {
  background: #fff;
  width: min(720px, 100%);
  border-radius: 10px;
  overflow: hidden;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
}
.modal-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}
.action-btn {
  padding: 6px 12px;
  border: 1px solid #ddd;
  background: #fafafa;
  border-radius: 6px;
  cursor: pointer;
}
.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.modal-body {
  padding: 16px;
}
.modal-image {
  width: 100%;
  height: 240px;
  object-fit: cover;
  border-radius: 8px;
}
.modal-author {
  color: #666;
  margin-top: 8px;
}
.modal-preview {
  margin-top: 12px;
  line-height: 1.7;
}
.appreciation {
  margin-top: 16px;
}
.block {
  margin-top: 10px;
}
.block-title {
  font-weight: bold;
  color: #333;
  margin-bottom: 6px;
}
.block-content {
  color: #555;
  line-height: 1.7;
}
.loading {
  color: #666;
}
.error {
  color: #c00;
}
</style>