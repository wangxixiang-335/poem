<template>
  <div v-if="show" class="online-search-modal" @click.self="$emit('close')">
    <div class="search-container">
      <div class="search-header">
        <h3>在线搜索诗词</h3>
        <button class="close-btn" @click="$emit('close')">×</button>
      </div>
      
      <div class="search-form">
        <div class="search-input-group">
          <input 
            v-model="searchKeyword"
            type="text"
            placeholder="请输入诗词标题、作者或关键词"
            class="search-input"
            @keyup.enter="handleSearch"
          />
          <button 
            class="search-btn"
            @click="handleSearch"
            :disabled="loading || !searchKeyword.trim()"
          >
            {{ loading ? '搜索中...' : '搜索' }}
          </button>
        </div>
      </div>

      <div class="search-results" v-if="searchResults.length > 0 || loading">
        <div v-if="loading" class="loading">
          <div class="loading-spinner"></div>
          <p>正在搜索诗词...</p>
        </div>
        
        <div v-else class="results-list">
          <div class="results-header">
            <span>找到 {{ totalResults }} 首相关诗词</span>
          </div>
          
          <div 
            v-for="poem in searchResults" 
            :key="poem.id"
            class="result-item"
          >
            <div class="poem-info">
              <div class="poem-header">
                <h4 class="poem-title">{{ poem.title }}</h4>
                <span class="poem-author">{{ poem.author }} · {{ poem.dynasty }}</span>
              </div>
              <p class="poem-preview">{{ poem.preview }}</p>
            </div>
            
            <div class="poem-actions">
              <button 
                class="add-btn"
                @click="handleAddPoem(poem)"
                :disabled="addedPoemIds.includes(poem.id)"
              >
                {{ addedPoemIds.includes(poem.id) ? '已添加' : '添加到主页' }}
              </button>
            </div>
          </div>
          
          <div class="pagination" v-if="totalResults > currentLimit">
            <button 
              class="page-btn"
              @click="loadMore"
              :disabled="loading"
            >
              加载更多
            </button>
          </div>
        </div>
      </div>
      
      <div v-else-if="hasSearched && !loading" class="no-results">
        <p>未找到相关诗词，请尝试其他关键词</p>
      </div>
      
      <div v-if="!hasSearched" class="search-tips">
        <h4>搜索提示</h4>
        <ul>
          <li>可以搜索诗词标题，如"静夜思"、"望庐山瀑布"</li>
          <li>可以搜索作者姓名，如"李白"、"杜甫"</li>
          <li>可以搜索诗词内容关键词，如"月亮"、"春天"</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { searchPoemsOnline, type SearchPoemItem, type PoemSearchResponse } from '../api/poem'

// 定义组件属性和事件
interface Props {
  show: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'add-poems', poems: SearchPoemItem[]): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 响应式数据
const searchKeyword = ref('')
const loading = ref(false)
const searchResults = ref<SearchPoemItem[]>([])
const totalResults = ref(0)
const currentPage = ref(1)
const currentLimit = ref(10)
const hasSearched = ref(false)
const addedPoemIds = ref<string[]>([])
const abortController = ref<AbortController | null>(null)

// 计算属性
const canLoadMore = computed(() => {
  return searchResults.value.length < totalResults.value
})

// 搜索诗词
const handleSearch = async () => {
  if (!searchKeyword.value.trim() || loading.value) return
  
  // 取消之前的请求
  if (abortController.value) {
    abortController.value.abort()
  }
  
  // 创建新的 AbortController
  abortController.value = new AbortController()
  
  loading.value = true
  hasSearched.value = true
  currentPage.value = 1
  searchResults.value = []
  addedPoemIds.value = []
  
  try {
    const response = await searchPoemsOnline({
      keyword: searchKeyword.value.trim(),
      page: currentPage.value,
      limit: currentLimit.value
    }, abortController.value.signal)
    
    // 处理响应数据，兼容 axios 响应格式
    const data: PoemSearchResponse = 'data' in response ? response.data : response
    
    searchResults.value = data.poems
    totalResults.value = data.total
    
  } catch (error: any) {
    if (error.message !== '搜索已取消') {
      console.error('搜索失败:', error)
      // 这里可以添加错误提示
    }
  } finally {
    loading.value = false
  }
}

// 加载更多
const loadMore = async () => {
  if (!canLoadMore.value || loading.value) return
  
  loading.value = true
  currentPage.value++
  
  try {
    const response = await searchPoemsOnline({
      keyword: searchKeyword.value.trim(),
      page: currentPage.value,
      limit: currentLimit.value
    })
    
    // 处理响应数据，兼容 axios 响应格式
    const data: PoemSearchResponse = 'data' in response ? response.data : response
    
    searchResults.value.push(...data.poems)
    
  } catch (error) {
    console.error('加载更多失败:', error)
    currentPage.value-- // 回退页码
  } finally {
    loading.value = false
  }
}

// 添加诗词到主页
const handleAddPoem = (poem: SearchPoemItem) => {
  if (addedPoemIds.value.includes(poem.id)) return
  
  addedPoemIds.value.push(poem.id)
  emit('add-poems', [poem])
}

// 组件卸载时取消请求
import { onBeforeUnmount } from 'vue'
onBeforeUnmount(() => {
  if (abortController.value) {
    abortController.value.abort()
  }
})
</script>

<style scoped>
.online-search-modal {
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
  padding: 20px;
}

.search-container {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 800px;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.search-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.search-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #6b7280;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.search-form {
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.search-input-group {
  display: flex;
  gap: 12px;
}

.search-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-btn {
  padding: 12px 24px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  white-space: nowrap;
}

.search-btn:hover:not(:disabled) {
  background: #2563eb;
}

.search-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.search-results {
  flex: 1;
  overflow-y: auto;
  padding: 0 24px;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #6b7280;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.results-header {
  padding: 16px 0;
  font-size: 14px;
  color: #6b7280;
  border-bottom: 1px solid #e5e7eb;
}

.results-list {
  padding-bottom: 20px;
}

.result-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px 0;
  border-bottom: 1px solid #f3f4f6;
}

.result-item:last-child {
  border-bottom: none;
}

.poem-info {
  flex: 1;
  margin-right: 20px;
}

.poem-header {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 8px;
}

.poem-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.poem-author {
  font-size: 14px;
  color: #6b7280;
}

.poem-preview {
  margin: 0;
  font-size: 14px;
  color: #4b5563;
  line-height: 1.5;
}

.poem-actions {
  flex-shrink: 0;
}

.add-btn {
  padding: 8px 16px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.add-btn:hover:not(:disabled) {
  background: #059669;
}

.add-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.pagination {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

.page-btn {
  padding: 10px 20px;
  background: #f3f4f6;
  color: #374151;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.page-btn:hover:not(:disabled) {
  background: #e5e7eb;
}

.page-btn:disabled {
  background: #f9fafb;
  color: #9ca3af;
  cursor: not-allowed;
}

.no-results {
  text-align: center;
  padding: 40px 20px;
  color: #6b7280;
}

.search-tips {
  padding: 20px 0;
}

.search-tips h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
  color: #1f2937;
}

.search-tips ul {
  margin: 0;
  padding-left: 20px;
  color: #6b7280;
}

.search-tips li {
  margin-bottom: 8px;
  font-size: 14px;
  line-height: 1.5;
}
</style>