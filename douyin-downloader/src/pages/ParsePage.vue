<template>
  <div class="page-container parse-page">
    <div class="page-header">
      <h1 class="page-title">链接解析</h1>
      <p class="page-desc">粘贴抖音分享链接，一键解析视频/图集内容</p>
    </div>

    <div class="parse-input-section glass-card">
      <div class="input-row">
        <el-input
          v-model="inputUrl"
          placeholder="请粘贴抖音分享链接，如：https://v.douyin.com/xxxxxx 或复制分享文本"
          size="large"
          clearable
          @keyup.enter="handleParse"
        >
          <template #prefix>
            <el-icon><Link /></el-icon>
          </template>
        </el-input>
        <el-button
          type="primary"
          size="large"
          class="douyin-btn"
          :loading="parsing"
          @click="handleParse"
        >
          <el-icon v-if="!parsing"><Search /></el-icon>
          {{ parsing ? '解析中...' : '解析' }}
        </el-button>
      </div>

      <div class="quick-actions">
        <el-button text size="small" @click="pasteFromClipboard">
          <el-icon><DocumentCopy /></el-icon> 从剪贴板粘贴
        </el-button>
        <el-button text size="small" @click="clearInput">
          <el-icon><Delete /></el-icon> 清空
        </el-button>
      </div>
    </div>

    <div v-if="videoInfo" class="parse-result glass-card">
      <div class="result-header">
        <div class="result-type-tag">
          <el-tag :type="videoInfo.type === 'video' ? 'danger' : 'success'" effect="dark" round>
            {{ videoInfo.type === 'video' ? '视频' : '图集' }}
          </el-tag>
        </div>
        <div class="result-actions">
          <el-button type="primary" class="douyin-btn" @click="handleDownload">
            <el-icon><Download /></el-icon> 下载
          </el-button>
          <el-button @click="handleDownloadAudio" v-if="videoInfo.musicUrl">
            <el-icon><Headset /></el-icon> 下载音频
          </el-button>
        </div>
      </div>

      <div class="result-content">
        <div class="result-cover">
          <el-image
            :src="videoInfo.cover"
            fit="cover"
            class="cover-image"
            :preview-src-list="[videoInfo.cover]"
          >
            <template #error>
              <div class="image-placeholder">
                <el-icon :size="40"><VideoCamera /></el-icon>
              </div>
            </template>
          </el-image>
          <div v-if="videoInfo.type === 'video'" class="play-overlay">
            <el-icon :size="48"><VideoPlay /></el-icon>
          </div>
          <div v-else class="image-count">
            <el-icon><Picture /></el-icon>
            {{ videoInfo.images?.length || 0 }}
          </div>
        </div>

        <div class="result-info">
          <div class="info-author">
            <el-avatar :size="36" :src="videoInfo.authorAvatar">
              <el-icon><User /></el-icon>
            </el-avatar>
            <span class="author-name">{{ videoInfo.author }}</span>
          </div>

          <p class="info-desc">{{ videoInfo.desc }}</p>

          <div class="info-stats">
            <div class="stat-item">
              <el-icon><Star /></el-icon>
              <span>{{ formatNumber(videoInfo.stats.likes) }}</span>
            </div>
            <div class="stat-item">
              <el-icon><ChatDotRound /></el-icon>
              <span>{{ formatNumber(videoInfo.stats.comments) }}</span>
            </div>
            <div class="stat-item">
              <el-icon><Share /></el-icon>
              <span>{{ formatNumber(videoInfo.stats.shares) }}</span>
            </div>
          </div>

          <div class="info-meta">
            <span class="meta-time">{{ formatTime(videoInfo.createTime) }}</span>
            <span class="meta-id">ID: {{ videoInfo.id }}</span>
          </div>
        </div>
      </div>

      <div v-if="videoInfo.type === 'images' && videoInfo.images" class="result-images">
        <h3 class="section-title">图集预览</h3>
        <div class="images-grid">
          <div
            v-for="(img, index) in videoInfo.images"
            :key="index"
            class="image-item"
          >
            <el-image
              :src="img"
              fit="cover"
              :preview-src-list="videoInfo.images"
              :initial-index="index"
            >
              <template #error>
                <div class="image-placeholder small">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-image>
            <div class="image-index">{{ index + 1 }}</div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="parseError" class="parse-error glass-card">
      <el-icon :size="48" color="#fe2c55"><CircleCloseFilled /></el-icon>
      <p class="error-text">{{ parseError }}</p>
      <el-button text type="primary" @click="parseError = ''">关闭</el-button>
    </div>

    <div v-if="!videoInfo && !parseError && !parsing" class="parse-tips glass-card">
      <div class="tips-icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
          <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" fill="#fe2c55" opacity="0.3"/>
        </svg>
      </div>
      <h3>如何获取分享链接？</h3>
      <div class="tips-steps">
        <div class="step">
          <span class="step-num">1</span>
          <span>打开抖音 APP，找到想下载的视频</span>
        </div>
        <div class="step">
          <span class="step-num">2</span>
          <span>点击右侧「分享」按钮</span>
        </div>
        <div class="step">
          <span class="step-num">3</span>
          <span>选择「复制链接」</span>
        </div>
        <div class="step">
          <span class="step-num">4</span>
          <span>粘贴到上方输入框，点击解析</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useAppStore } from '@/stores/app'
import type { VideoItem } from '@/stores/app'
import { browserParse } from '@/utils/browserParser'

const store = useAppStore()
const inputUrl = ref('')
const parsing = ref(false)
const videoInfo = ref<VideoItem | null>(null)
const parseError = ref('')

const isElectron = !!window.electronAPI

const extractUrl = (text: string): string => {
  const douyinShortUrlRegex = /https?:\/\/v\.douyin\.com\/[a-zA-Z0-9]+\/?/
  const shortMatch = text.match(douyinShortUrlRegex)
  if (shortMatch) return shortMatch[0]

  const douyinLongUrlRegex = /https?:\/\/www\.douyin\.com\/[^\s\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]+/
  const longMatch = text.match(douyinLongUrlRegex)
  if (longMatch) return longMatch[0]

  const iesdouyinUrlRegex = /https?:\/\/www\.iesdouyin\.com\/[^\s\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]+/
  const iesMatch = text.match(iesdouyinUrlRegex)
  if (iesMatch) return iesMatch[0]

  const tiktokUrlRegex = /https?:\/\/(?:vt\.tiktok\.com|www\.tiktok\.com)\/[^\s\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]+/
  const tiktokMatch = text.match(tiktokUrlRegex)
  if (tiktokMatch) return tiktokMatch[0]

  const generalUrlRegex = /https?:\/\/[^\s\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]+/
  const generalMatch = text.match(generalUrlRegex)
  if (generalMatch) return generalMatch[0]

  return text.trim()
}

const isShareCodeText = (text: string): boolean => {
  if (/https?:\/\//.test(text)) return false
  return (
    /[a-zA-Z0-9@._]+\s*[a-zA-Z0-9]+:\/\s/.test(text) ||
    text.includes('复制此链接') ||
    text.includes('打开Dou音') ||
    text.includes('打开抖音') ||
    text.includes('直接观看')
  )
}

const handleParse = async () => {
  if (!inputUrl.value.trim()) {
    ElMessage.warning('请输入抖音分享链接')
    return
  }

  const trimmedInput = inputUrl.value.trim()

  if (isShareCodeText(trimmedInput) && !/https?:\/\//.test(trimmedInput)) {
    parseError.value =
      '检测到抖音口令分享文本，但未找到链接地址。\n' +
      '请在抖音中使用「复制链接」而非「复制口令」来分享。\n' +
      '有效格式示例：包含 https://v.douyin.com/xxx/ 的分享文本'
    ElMessage.warning({
      message: '请使用「复制链接」分享，当前为口令格式',
      duration: 5000,
    })
    return
  }

  const url = extractUrl(trimmedInput)
  parsing.value = true
  parseError.value = ''
  videoInfo.value = null

  try {
    let result: any = null

    if (isElectron) {
      result = await window.electronAPI.parseUrl(url)
    } else {
      result = await browserParse(url)
    }

    if (result?.success) {
      videoInfo.value = result.data
      store.currentVideo = result.data
      ElMessage.success('解析成功！')
    } else {
      parseError.value = result?.error || '解析失败，请检查链接是否正确'
      ElMessage.error(parseError.value)
    }
  } catch (error: any) {
    parseError.value = error.message || '网络错误，请重试'
    ElMessage.error(parseError.value)
  } finally {
    parsing.value = false
  }
}

const handleDownload = async () => {
  if (!videoInfo.value) return

  const savePath = store.savePath || (await window.electronAPI?.selectDirectory())
  if (!savePath) return

  store.savePath = savePath

  if (videoInfo.value.type === 'video') {
    const filename = `${videoInfo.value.author}_${videoInfo.value.id}.mp4`
    const result = await window.electronAPI?.downloadFile({
      url: videoInfo.value.videoUrl,
      filename,
      savePath,
    })

    if (result?.success) {
      store.addDownloadTask({
        id: result.data.id,
        filename,
        url: videoInfo.value.videoUrl,
        savePath,
        progress: 0,
        status: 'downloading',
        totalBytes: 0,
        receivedBytes: 0,
        type: 'video',
        cover: videoInfo.value.cover,
        createdAt: Date.now(),
      })
      ElMessage.success('已添加到下载队列')
    }
  } else if (videoInfo.value.type === 'images' && videoInfo.value.images) {
    const items = videoInfo.value.images.map((img, index) => ({
      url: img,
      filename: `${videoInfo.value.author}_${videoInfo.value.id}_${index + 1}.jpg`,
    }))

    const result = await window.electronAPI?.batchDownload({ items, savePath })

    if (result?.success) {
      result.data.ids.forEach((id: string, index: number) => {
        store.addDownloadTask({
          id,
          filename: items[index].filename,
          url: items[index].url,
          savePath,
          progress: 0,
          status: 'downloading',
          totalBytes: 0,
          receivedBytes: 0,
          type: 'images',
          cover: videoInfo.value!.cover,
          createdAt: Date.now(),
        })
      })
      ElMessage.success(`已添加 ${items.length} 张图片到下载队列`)
    }
  }
}

const handleDownloadAudio = async () => {
  if (!videoInfo.value?.musicUrl) return

  const savePath = store.savePath || (await window.electronAPI?.selectDirectory())
  if (!savePath) return

  store.savePath = savePath

  const filename = `${videoInfo.value.author}_${videoInfo.value.id}_audio.mp3`
  const result = await window.electronAPI?.downloadFile({
    url: videoInfo.value.musicUrl,
    filename,
    savePath,
  })

  if (result?.success) {
    store.addDownloadTask({
      id: result.data.id,
      filename,
      url: videoInfo.value.musicUrl!,
      savePath,
      progress: 0,
      status: 'downloading',
      totalBytes: 0,
      receivedBytes: 0,
      type: 'video',
      cover: videoInfo.value.cover,
      createdAt: Date.now(),
    })
    ElMessage.success('音频已添加到下载队列')
  }
}

const pasteFromClipboard = async () => {
  try {
    const text = await navigator.clipboard.readText()
    inputUrl.value = text
    ElMessage.success('已粘贴')
  } catch {
    ElMessage.error('无法访问剪贴板')
  }
}

const clearInput = () => {
  inputUrl.value = ''
  videoInfo.value = null
  parseError.value = ''
}

const formatNumber = (num: number): string => {
  if (num >= 10000) return (num / 10000).toFixed(1) + 'w'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k'
  return num.toString()
}

const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp * 1000)
  return date.toLocaleDateString('zh-CN')
}
</script>

<style lang="scss" scoped>
.parse-page {
  max-width: 900px;
  margin: 0 auto;
}

.parse-input-section {
  padding: 24px;
  margin-bottom: 20px;

  .input-row {
    display: flex;
    gap: 12px;

    .el-input {
      flex: 1;
    }
  }

  .quick-actions {
    display: flex;
    gap: 8px;
    margin-top: 12px;
    padding-left: 4px;
  }
}

.parse-result {
  padding: 24px;
  margin-bottom: 20px;

  .result-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .result-content {
    display: flex;
    gap: 24px;
  }

  .result-cover {
    width: 240px;
    height: 320px;
    border-radius: 12px;
    overflow: hidden;
    position: relative;
    flex-shrink: 0;

    .cover-image {
      width: 100%;
      height: 100%;
    }

    .play-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.3);
      opacity: 0;
      transition: opacity 0.3s;
      cursor: pointer;

      &:hover {
        opacity: 1;
      }
    }

    .image-count {
      position: absolute;
      bottom: 8px;
      right: 8px;
      background: rgba(0, 0, 0, 0.6);
      color: white;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 12px;
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }

  .result-info {
    flex: 1;
    display: flex;
    flex-direction: column;

    .info-author {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 16px;

      .author-name {
        font-weight: 600;
        font-size: 16px;
      }
    }

    .info-desc {
      font-size: 14px;
      line-height: 1.6;
      color: var(--text-secondary);
      margin-bottom: 16px;
      flex: 1;
    }

    .info-stats {
      display: flex;
      gap: 24px;
      margin-bottom: 16px;

      .stat-item {
        display: flex;
        align-items: center;
        gap: 6px;
        color: var(--text-secondary);
        font-size: 14px;
      }
    }

    .info-meta {
      display: flex;
      gap: 16px;
      font-size: 12px;
      color: var(--text-muted);
    }
  }
}

.result-images {
  margin-top: 24px;
  border-top: 1px solid var(--border-color);
  padding-top: 20px;

  .section-title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 16px;
    color: var(--text-primary);
  }

  .images-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
  }

  .image-item {
    aspect-ratio: 1;
    border-radius: 8px;
    overflow: hidden;
    position: relative;
    cursor: pointer;

    .el-image {
      width: 100%;
      height: 100%;
    }

    .image-index {
      position: absolute;
      top: 6px;
      left: 6px;
      background: rgba(0, 0, 0, 0.6);
      color: white;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
    }
  }
}

.parse-error {
  padding: 40px;
  text-align: center;
  margin-bottom: 20px;

  .error-text {
    margin: 16px 0;
    color: var(--text-secondary);
    font-size: 14px;
  }
}

.parse-tips {
  padding: 40px;
  text-align: center;

  .tips-icon {
    margin-bottom: 16px;
  }

  h3 {
    font-size: 18px;
    margin-bottom: 24px;
    color: var(--text-primary);
  }

  .tips-steps {
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-width: 400px;
    margin: 0 auto;

    .step {
      display: flex;
      align-items: center;
      gap: 12px;
      text-align: left;

      .step-num {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: var(--accent-gradient);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        font-weight: 600;
        flex-shrink: 0;
      }

      span:last-child {
        color: var(--text-secondary);
        font-size: 14px;
      }
    }
  }
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-tertiary);
  color: var(--text-muted);

  &.small {
    :deep(.el-icon) {
      font-size: 24px;
    }
  }
}
</style>
