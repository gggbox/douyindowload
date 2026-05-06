<template>
  <div class="page-container browser-page">
    <div class="browser-toolbar glass-card">
      <div class="toolbar-left">
        <el-button-group>
          <el-button size="small" @click="goBack" :disabled="!canGoBack">
            <el-icon><ArrowLeft /></el-icon>
          </el-button>
          <el-button size="small" @click="goForward" :disabled="!canGoForward">
            <el-icon><ArrowRight /></el-icon>
          </el-button>
          <el-button size="small" @click="refreshPage">
            <el-icon><Refresh /></el-icon>
          </el-button>
        </el-button-group>

        <div class="url-bar">
          <el-input
            v-model="currentUrl"
            placeholder="输入网址或搜索内容"
            size="small"
            @keyup.enter="navigateTo(currentUrl)"
          >
            <template #prefix>
              <el-icon><Link /></el-icon>
            </template>
          </el-input>
        </div>

        <el-button size="small" type="primary" class="douyin-btn" @click="navigateTo(currentUrl)">
          前往
        </el-button>
      </div>

      <div class="toolbar-right">
        <el-button
          type="primary"
          class="douyin-btn parse-btn"
          @click="parseCurrentPage"
          :loading="parsing"
        >
          <el-icon><MagicStick /></el-icon>
          一键解析下载
        </el-button>
        <el-button size="small" @click="goToDouyin">
          <el-icon><HomeFilled /></el-icon> 抖音首页
        </el-button>
      </div>
    </div>

    <div class="browser-content">
      <div class="webview-container">
        <webview
          v-if="isElectron"
          ref="browserWebview"
          :src="displayUrl"
          class="browser-webview"
          allowpopups
          :useragent="userAgent"
          @did-navigate="onWebviewNavigate"
          @did-navigate-in-page="onWebviewNavigateInPage"
          @did-finish-load="onWebviewPageLoad"
        ></webview>
        <iframe
          v-else
          ref="browserFrame"
          :src="displayUrl"
          class="browser-iframe"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          @load="onIframeLoad"
        ></iframe>
      </div>

      <div class="side-panel" :class="{ open: sidePanelOpen }">
        <div class="panel-header">
          <h3>解析结果</h3>
          <el-button text size="small" @click="sidePanelOpen = false">
            <el-icon><Close /></el-icon>
          </el-button>
        </div>

        <div v-if="parsedVideo" class="panel-content">
          <div class="parsed-video-card">
            <div class="parsed-cover">
              <el-image :src="parsedVideo.cover" fit="cover">
                <template #error>
                  <div class="image-placeholder">
                    <el-icon><VideoCamera /></el-icon>
                  </div>
                </template>
              </el-image>
              <el-tag
                :type="parsedVideo.type === 'video' ? 'danger' : 'success'"
                effect="dark"
                size="small"
                round
                class="type-tag"
              >
                {{ parsedVideo.type === 'video' ? '视频' : '图集' }}
              </el-tag>
            </div>

            <div class="parsed-info">
              <div class="parsed-author">
                <el-avatar :size="24" :src="parsedVideo.authorAvatar">
                  <el-icon><User /></el-icon>
                </el-avatar>
                <span>{{ parsedVideo.author }}</span>
              </div>
              <p class="parsed-desc">{{ parsedVideo.desc }}</p>
              <div class="parsed-stats">
                <span><el-icon><Star /></el-icon> {{ formatNumber(parsedVideo.stats.likes) }}</span>
                <span><el-icon><ChatDotRound /></el-icon> {{ formatNumber(parsedVideo.stats.comments) }}</span>
              </div>
            </div>
          </div>

          <div class="parsed-actions">
            <el-button type="primary" class="douyin-btn" @click="downloadParsed" block>
              <el-icon><Download /></el-icon> 立即下载
            </el-button>
            <el-button v-if="parsedVideo.musicUrl" @click="downloadAudio" block>
              <el-icon><Headset /></el-icon> 下载音频
            </el-button>
          </div>

          <div v-if="parsedVideo.type === 'images' && parsedVideo.images" class="parsed-images">
            <h4>图集 ({{ parsedVideo.images.length }}张)</h4>
            <div class="images-preview">
              <el-image
                v-for="(img, i) in parsedVideo.images"
                :key="i"
                :src="img"
                fit="cover"
                class="preview-thumb"
                :preview-src-list="parsedVideo.images"
                :initial-index="i"
              />
            </div>
          </div>
        </div>

        <div v-else class="panel-empty">
          <el-icon :size="48" color="#fe2c55"><VideoCamera /></el-icon>
          <p>浏览抖音视频时，点击「一键解析下载」按钮</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useAppStore } from '@/stores/app'
import type { VideoItem } from '@/stores/app'

const store = useAppStore()
const currentUrl = ref('https://www.douyin.com')
const displayUrl = ref('https://www.douyin.com')
const browserWebview = ref<any>(null)
const browserFrame = ref<HTMLIFrameElement | null>(null)
const canGoBack = ref(false)
const canGoForward = ref(false)
const parsing = ref(false)
const sidePanelOpen = ref(false)
const parsedVideo = ref<VideoItem | null>(null)

const isElectron = computed(() => !!window.electronAPI)

const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

const navigateTo = (url: string) => {
  if (!url) return

  let targetUrl = url
  if (!url.startsWith('http')) {
    if (url.includes('.') && !url.includes(' ')) {
      targetUrl = 'https://' + url
    } else {
      targetUrl = `https://www.douyin.com/search/${encodeURIComponent(url)}`
    }
  }

  currentUrl.value = targetUrl
  displayUrl.value = targetUrl
  canGoBack.value = true
}

const goBack = () => {
  if (isElectron.value && browserWebview.value && typeof browserWebview.value.goBack === 'function') {
    browserWebview.value.goBack()
  } else if (browserFrame.value) {
    try {
      browserFrame.value.contentWindow?.history.back()
      canGoForward.value = true
    } catch {
      // cross-origin
    }
  }
}

const goForward = () => {
  if (isElectron.value && browserWebview.value && typeof browserWebview.value.goForward === 'function') {
    browserWebview.value.goForward()
  } else if (browserFrame.value) {
    try {
      browserFrame.value.contentWindow?.history.forward()
    } catch {
      // cross-origin
    }
  }
}

const refreshPage = () => {
  if (isElectron.value && browserWebview.value && typeof browserWebview.value.reload === 'function') {
    browserWebview.value.reload()
  } else {
    displayUrl.value = ''
    setTimeout(() => {
      displayUrl.value = currentUrl.value
    }, 50)
  }
}

const goToDouyin = () => {
  navigateTo('https://www.douyin.com')
}

const onWebviewNavigate = (event: any) => {
  currentUrl.value = event.url
  if (browserWebview.value && typeof browserWebview.value.canGoBack === 'function') {
    canGoBack.value = browserWebview.value.canGoBack()
    canGoForward.value = browserWebview.value.canGoForward()
  }
}

const onWebviewNavigateInPage = (event: any) => {
  if (event.url) {
    currentUrl.value = event.url
  }
}

const onWebviewPageLoad = () => {
  if (browserWebview.value && typeof browserWebview.value.canGoBack === 'function') {
    canGoBack.value = browserWebview.value.canGoBack()
    canGoForward.value = browserWebview.value.canGoForward()
  }
}

const onIframeLoad = () => {
  try {
    const frameUrl = browserFrame.value?.contentWindow?.location.href
    if (frameUrl && frameUrl !== 'about:blank') {
      currentUrl.value = frameUrl
    }
  } catch {
    // cross-origin, keep current url
  }
}

const parseCurrentPage = async () => {
  parsing.value = true
  sidePanelOpen.value = true

  try {
    const urlToParse = currentUrl.value
    const result = await window.electronAPI?.parseUrl(urlToParse)

    if (result?.success) {
      parsedVideo.value = result.data
      ElMessage.success('解析成功！')
    } else {
      const videoIdMatch = urlToParse.match(/video\/(\d+)/)
      const noteIdMatch = urlToParse.match(/note\/(\d+)/)
      const id = videoIdMatch?.[1] || noteIdMatch?.[1]

      if (id) {
        const detailResult = await window.electronAPI?.parseUrl(
          `https://www.douyin.com/video/${id}`
        )
        if (detailResult?.success) {
          parsedVideo.value = detailResult.data
          ElMessage.success('解析成功！')
        } else {
          ElMessage.error('解析失败，请确保当前页面是视频详情页')
        }
      } else {
        ElMessage.error('当前页面不是视频页面，请导航到具体视频后重试')
      }
    }
  } catch (error: any) {
    ElMessage.error(error.message || '解析失败')
  } finally {
    parsing.value = false
  }
}

const downloadParsed = async () => {
  if (!parsedVideo.value) return

  const savePath = store.savePath || (await window.electronAPI?.selectDirectory())
  if (!savePath) return

  store.savePath = savePath

  if (parsedVideo.value.type === 'video') {
    const filename = `${parsedVideo.value.author}_${parsedVideo.value.id}.mp4`
    const result = await window.electronAPI?.downloadFile({
      url: parsedVideo.value.videoUrl,
      filename,
      savePath,
    })

    if (result?.success) {
      store.addDownloadTask({
        id: result.data.id,
        filename,
        url: parsedVideo.value.videoUrl,
        savePath,
        progress: 0,
        status: 'downloading',
        totalBytes: 0,
        receivedBytes: 0,
        type: 'video',
        cover: parsedVideo.value.cover,
        createdAt: Date.now(),
      })
      ElMessage.success('已添加到下载队列')
    }
  } else if (parsedVideo.value.type === 'images' && parsedVideo.value.images) {
    const items = parsedVideo.value.images.map((img, index) => ({
      url: img,
      filename: `${parsedVideo.value!.author}_${parsedVideo.value!.id}_${index + 1}.jpg`,
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
          cover: parsedVideo.value!.cover,
          createdAt: Date.now(),
        })
      })
      ElMessage.success(`已添加 ${items.length} 张图片到下载队列`)
    }
  }
}

const downloadAudio = async () => {
  if (!parsedVideo.value?.musicUrl) return

  const savePath = store.savePath || (await window.electronAPI?.selectDirectory())
  if (!savePath) return

  store.savePath = savePath

  const filename = `${parsedVideo.value.author}_${parsedVideo.value.id}_audio.mp3`
  const result = await window.electronAPI?.downloadFile({
    url: parsedVideo.value.musicUrl,
    filename,
    savePath,
  })

  if (result?.success) {
    store.addDownloadTask({
      id: result.data.id,
      filename,
      url: parsedVideo.value.musicUrl!,
      savePath,
      progress: 0,
      status: 'downloading',
      totalBytes: 0,
      receivedBytes: 0,
      type: 'video',
      cover: parsedVideo.value.cover,
      createdAt: Date.now(),
    })
    ElMessage.success('音频已添加到下载队列')
  }
}

const formatNumber = (num: number): string => {
  if (num >= 10000) return (num / 10000).toFixed(1) + 'w'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k'
  return num.toString()
}
</script>

<style lang="scss" scoped>
.browser-page {
  display: flex;
  flex-direction: column;
  padding: 12px;
  height: 100%;
  overflow: hidden;
}

.browser-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  margin-bottom: 12px;
  flex-shrink: 0;

  .toolbar-left {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1;

    .url-bar {
      flex: 1;
      max-width: 500px;
    }
  }

  .toolbar-right {
    display: flex;
    align-items: center;
    gap: 8px;

    .parse-btn {
      animation: pulse 2s infinite;
    }
  }
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(254, 44, 85, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(254, 44, 85, 0); }
  100% { box-shadow: 0 0 0 0 rgba(254, 44, 85, 0); }
}

.browser-content {
  flex: 1;
  display: flex;
  gap: 0;
  overflow: hidden;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  position: relative;
}

.webview-container {
  flex: 1;
  position: relative;

  .browser-webview,
  .browser-iframe {
    width: 100%;
    height: 100%;
    border: none;
    background: white;
  }
}

.side-panel {
  width: 0;
  overflow: hidden;
  background: var(--bg-secondary);
  border-left: 1px solid var(--border-color);
  transition: width 0.3s ease;
  display: flex;
  flex-direction: column;

  &.open {
    width: 340px;
  }

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid var(--border-color);

    h3 {
      font-size: 16px;
      font-weight: 600;
    }
  }

  .panel-content {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
  }

  .panel-empty {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    text-align: center;

    p {
      margin-top: 16px;
      color: var(--text-secondary);
      font-size: 14px;
      line-height: 1.6;
    }
  }
}

.parsed-video-card {
  .parsed-cover {
    position: relative;
    border-radius: 8px;
    overflow: hidden;
    aspect-ratio: 16/9;
    margin-bottom: 12px;

    .el-image {
      width: 100%;
      height: 100%;
    }

    .type-tag {
      position: absolute;
      top: 8px;
      left: 8px;
    }
  }

  .parsed-info {
    .parsed-author {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      font-size: 14px;
      font-weight: 500;
    }

    .parsed-desc {
      font-size: 13px;
      color: var(--text-secondary);
      line-height: 1.5;
      margin-bottom: 8px;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .parsed-stats {
      display: flex;
      gap: 16px;
      font-size: 12px;
      color: var(--text-muted);

      span {
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }
  }
}

.parsed-actions {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.parsed-images {
  margin-top: 16px;
  border-top: 1px solid var(--border-color);
  padding-top: 16px;

  h4 {
    font-size: 14px;
    margin-bottom: 12px;
  }

  .images-preview {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;

    .preview-thumb {
      aspect-ratio: 1;
      border-radius: 6px;
      overflow: hidden;
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
}
</style>
