<template>
  <!-- 悬浮AI助手按钮 -->
  <div class="ai-assistant" :class="{ 'expanded': isExpanded }">
    <!-- 悬浮按钮 -->
    <button 
      class="assistant-toggle" 
      @click="toggleAssistant"
      :aria-label="isExpanded ? '收起AI助手' : '展开AI助手'"
    >
      <span class="assistant-icon">🤖</span>
    </button>

    <!-- 聊天界面 -->
    <div v-if="isExpanded" class="chat-container">
      <!-- 聊天头部 -->
      <div class="chat-header">
        <h3>AI诗词助手</h3>
        <button class="close-btn" @click="closeAssistant" aria-label="关闭">✖</button>
      </div>

      <!-- 消息列表 -->
      <div class="messages-container" ref="messagesContainer">
        <div 
          v-for="(message, index) in messages" 
          :key="index" 
          class="message" 
          :class="message.type"
        >
          <div class="message-avatar">
            <span v-if="message.type === 'ai'">🤖</span>
            <span v-else>👤</span>
          </div>
          <div class="message-content">
            <div class="message-text">{{ message.text }}</div>
            <div class="message-time">{{ formatTime(message.timestamp) }}</div>
          </div>
        </div>
        
        <!-- 加载状态 -->
        <div v-if="isLoading" class="message ai">
          <div class="message-avatar">🤖</div>
          <div class="message-content">
            <div class="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="input-container">
        <div class="quick-actions">
          <button 
            v-for="action in quickActions" 
            :key="action.text"
            class="quick-action-btn"
            @click="sendQuickMessage(action.text)"
          >
            {{ action.text }}
          </button>
        </div>
        
        <div class="input-wrapper">
          <input
            v-model="inputMessage"
            type="text"
            placeholder="输入您的问题..."
            @keydown.enter="sendMessage"
            class="message-input"
            :disabled="isLoading"
          />
          <button 
            @click="sendMessage" 
            class="send-btn"
            :disabled="!inputMessage.trim() || isLoading"
          >
            📤
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'

// 状态管理
const isExpanded = ref(false)
const isLoading = ref(false)
const inputMessage = ref('')
const messagesContainer = ref<HTMLDivElement | null>(null)

// 消息历史
interface ChatMessage {
  type: 'user' | 'ai'
  text: string
  timestamp: Date
}

const messages = ref<ChatMessage[]>([
  {
    type: 'ai',
    text: '您好！我是AI诗词助手，可以帮您：\n• 解析诗词意境\n• 推荐相关诗词\n• 解答诗词疑问\n• 创作诗词赏析\n\n请问有什么可以帮您的？',
    timestamp: new Date()
  }
])

// 快捷操作
const quickActions = ref([
  { text: '推荐一首唐诗' },
  { text: '解析《静夜思》' },
  { text: '什么是律诗？' },
  { text: '帮我写诗赏析' }
])

// 切换助手状态
const toggleAssistant = () => {
  isExpanded.value = !isExpanded.value
}

// 关闭助手
const closeAssistant = () => {
  isExpanded.value = false
}

// 发送快捷消息
const sendQuickMessage = (text: string) => {
  inputMessage.value = text
  sendMessage()
}

// 发送消息
const sendMessage = async () => {
  const text = inputMessage.value.trim()
  if (!text || isLoading.value) return

  // 添加用户消息
  messages.value.push({
    type: 'user',
    text: text,
    timestamp: new Date()
  })

  inputMessage.value = ''
  isLoading.value = true

  // 模拟AI响应（实际项目中应该调用AI API）
  setTimeout(() => {
    const aiResponse = generateAIResponse(text)
    messages.value.push({
      type: 'ai',
      text: aiResponse,
      timestamp: new Date()
    })
    isLoading.value = false
    scrollToBottom()
  }, 1000 + Math.random() * 2000) // 模拟网络延迟
}

// 生成AI响应
const generateAIResponse = (userMessage: string): string => {
  const lowerMessage = userMessage.toLowerCase()
  
  if (lowerMessage.includes('推荐') || lowerMessage.includes('唐诗')) {
    return `我为您推荐李白的《将进酒》：
    
君不见黄河之水天上来，奔流到海不复回。
君不见高堂明镜悲白发，朝如青丝暮成雪。
人生得意须尽欢，莫使金樽空对月。
天生我材必有用，千金散尽还复来。

这首诗表达了诗人对人生的豪迈态度和对时光流逝的感慨，展现了李白豪放不羁的性格。`
  }
  
  if (lowerMessage.includes('解析') || lowerMessage.includes('静夜思')) {
    return `《静夜思》是唐代诗人李白的代表作之一：

床前明月光，疑是地上霜。
举头望明月，低头思故乡。

【意境解析】
这首诗通过明月意象，表达了游子思乡之情。月光如霜的比喻，营造出清冷孤寂的氛围。

【创作特色】
• 语言简练，意境深远
• 善用比喻，情感真挚
• 四句成诗，结构完整

【历史地位】
被誉为"千古思乡第一诗"，影响深远。`
  }
  
  if (lowerMessage.includes('律诗') || lowerMessage.includes('什么是')) {
    return `律诗是中国传统诗歌的一种体裁：

【基本特征】
• 八句成篇，每句五言或七言
• 中间两联必须对仗
• 讲究平仄格律
• 押韵严格，一韵到底

【著名律诗】
• 杜甫《春望》- 五言律诗典范
• 李商隐《锦瑟》- 七言律诗精品
• 王维《山居秋暝》- 山水田园代表

律诗在唐代达到艺术高峰，是古典诗歌的重要形式。`
  }
  
  if (lowerMessage.includes('赏析') || lowerMessage.includes('创作')) {
    return `我来为您创作一首诗词赏析：

《春江花月夜》赏析

【意境之美】
全诗以春、江、花、月、夜五种意象交织，营造出空灵悠远的意境。江水连海平，明月共潮生，展现了大自然的壮阔与生命的永恒。

【情感表达】
诗人通过对景物的细腻描写，抒发了对人生、宇宙的深刻思考。\"人生代代无穷已，江月年年望相似\"，体现了时空永恒与人生短暂的哲学思考。

【艺术特色】
• 意象丰富，意境深远
• 语言优美，韵律和谐
• 情景交融，哲理深刻

这首诗被誉为\"孤篇横绝全唐\"，是张若虚的代表作。`
  }
  
  // 默认响应
  return `感谢您的提问！关于"${userMessage}"，我可以为您提供以下帮助：

1. 详细的诗词解析和背景介绍
2. 相关诗词的推荐和比较
3. 创作技巧和艺术特色的分析
4. 历史背景和文化内涵的解读

如果您有具体的诗词或问题，请告诉我更多细节，我会为您提供更精准的帮助！`
}

// 格式化时间
const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

// 监听消息变化，自动滚动
watch(messages, () => {
  scrollToBottom()
}, { deep: true })

// 点击外部关闭
const handleClickOutside = (event: MouseEvent) => {
  const assistantElement = document.querySelector('.ai-assistant')
  if (assistantElement && !assistantElement.contains(event.target as Node)) {
    isExpanded.value = false
  }
}

// 生命周期
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.ai-assistant {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  transition: all 0.3s ease;
}

/* 悬浮按钮 */
.assistant-toggle {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.assistant-toggle:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.2);
}

.assistant-icon {
  font-size: 24px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

/* 聊天容器 */
.chat-container {
  position: absolute;
  bottom: 70px;
  right: 0;
  width: 350px;
  height: 500px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 聊天头部 */
.chat-header {
  padding: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* 消息容器 */
.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: #f8f9fa;
}

/* 消息样式 */
.message {
  display: flex;
  margin-bottom: 16px;
  animation: fadeIn 0.3s ease;
}

.message.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  margin: 0 8px;
  flex-shrink: 0;
}

.message.user .message-avatar {
  background: #667eea;
  color: white;
}

.message-content {
  max-width: 70%;
  background: white;
  padding: 12px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.message.user .message-content {
  background: #667eea;
  color: white;
}

.message-text {
  white-space: pre-line;
  line-height: 1.5;
  font-size: 14px;
}

.message-time {
  font-size: 11px;
  opacity: 0.7;
  margin-top: 4px;
}

/* 输入区域 */
.input-container {
  padding: 16px;
  background: white;
  border-top: 1px solid #e9ecef;
}

.quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.quick-action-btn {
  padding: 6px 12px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 16px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.quick-action-btn:hover {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.input-wrapper {
  display: flex;
  gap: 8px;
}

.message-input {
  flex: 1;
  padding: 12px;
  border: 1px solid #e9ecef;
  border-radius: 24px;
  outline: none;
  font-size: 14px;
  transition: border-color 0.2s;
}

.message-input:focus {
  border-color: #667eea;
}

.message-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.send-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #667eea;
  border: none;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.send-btn:hover:not(:disabled) {
  background: #5a6fd8;
  transform: scale(1.05);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 打字指示器 */
.typing-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
}

.typing-indicator span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #666;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
.typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

@keyframes typing {
  0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
  40% { transform: scale(1); opacity: 1; }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 响应式设计 */
@media (max-width: 480px) {
  .ai-assistant {
    bottom: 10px;
    right: 10px;
  }
  
  .chat-container {
    width: calc(100vw - 20px);
    height: 70vh;
    bottom: 60px;
    right: 10px;
  }
  
  .assistant-toggle {
    width: 50px;
    height: 50px;
  }
}
</style>