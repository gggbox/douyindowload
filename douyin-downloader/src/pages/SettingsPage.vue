<template>
  <div class="page-container settings-page">
    <div class="page-header">
      <h1 class="page-title">设置</h1>
      <p class="page-desc">配置下载路径、Cookie 和其他选项</p>
    </div>

    <div class="settings-section glass-card">
      <h3 class="section-title">下载设置</h3>

      <el-form label-position="top" size="large">
        <el-form-item label="默认保存路径">
          <div class="path-input">
            <el-input v-model="savePath" placeholder="选择下载保存路径" readonly>
              <template #prefix>
                <el-icon><Folder /></el-icon>
              </template>
            </el-input>
            <el-button @click="selectSavePath">
              <el-icon><FolderOpened /></el-icon> 浏览
            </el-button>
          </div>
        </el-form-item>

        <el-form-item label="文件名格式">
          <el-select v-model="filenameFormat" style="width: 100%">
            <el-option label="作者_视频ID.扩展名" value="author_id" />
            <el-option label="视频ID.扩展名" value="id" />
            <el-option label="作者_描述_视频ID.扩展名" value="author_desc_id" />
            <el-option label="日期_视频ID.扩展名" value="date_id" />
          </el-select>
        </el-form-item>

        <el-form-item label="同时下载数">
          <el-slider v-model="concurrentDownloads" :min="1" :max="5" :step="1" show-stops />
          <span class="slider-label">{{ concurrentDownloads }} 个任务同时下载</span>
        </el-form-item>

        <el-form-item label="自动重试">
          <el-switch v-model="autoRetry" active-text="开启" inactive-text="关闭" />
          <span class="switch-desc">下载失败时自动重试</span>
        </el-form-item>

        <el-form-item v-if="autoRetry" label="重试次数">
          <el-input-number v-model="retryCount" :min="1" :max="5" />
        </el-form-item>
      </el-form>
    </div>

    <div class="settings-section glass-card">
      <h3 class="section-title">Cookie 设置</h3>
      <p class="section-desc">
        设置抖音 Cookie 可以解析更多内容。在浏览器中登录抖音后，复制 Cookie 粘贴到下方。
      </p>

      <el-form label-position="top" size="large">
        <el-form-item label="抖音 Cookie">
          <el-input
            v-model="cookie"
            type="textarea"
            :rows="4"
            placeholder="粘贴抖音 Cookie..."
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" class="douyin-btn" @click="saveCookie">
            <el-icon><Check /></el-icon> 保存 Cookie
          </el-button>
          <el-button @click="clearCookie">
            <el-icon><Delete /></el-icon> 清除 Cookie
          </el-button>
        </el-form-item>

        <el-alert
          title="如何获取 Cookie？"
          type="info"
          :closable="false"
          show-icon
        >
          <template #default>
            <ol class="cookie-steps">
              <li>在浏览器中打开 douyin.com 并登录</li>
              <li>按 F12 打开开发者工具</li>
              <li>切换到「网络」(Network) 标签</li>
              <li>刷新页面，找到任意请求</li>
              <li>在请求头中找到 Cookie 字段并复制</li>
            </ol>
          </template>
        </el-alert>
      </el-form>
    </div>

    <div class="settings-section glass-card">
      <h3 class="section-title">外观设置</h3>

      <el-form label-position="top" size="large">
        <el-form-item label="主题">
          <el-radio-group v-model="theme">
            <el-radio-button label="dark">深色模式</el-radio-button>
            <el-radio-button label="light">浅色模式</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="主色调">
          <div class="color-options">
            <div
              v-for="color in themeColors"
              :key="color.value"
              class="color-option"
              :class="{ active: primaryColor === color.value }"
              :style="{ background: color.value }"
              @click="primaryColor = color.value"
            >
              <el-icon v-if="primaryColor === color.value"><Check /></el-icon>
            </div>
          </div>
        </el-form-item>
      </el-form>
    </div>

    <div class="settings-section glass-card">
      <h3 class="section-title">关于</h3>
      <div class="about-info">
        <div class="about-logo">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" fill="#FE2C55"/>
          </svg>
        </div>
        <div class="about-text">
          <h2>抖音下载器</h2>
          <p>版本 1.0.0</p>
          <p>基于 Electron + Vue 3 + Element Plus 构建</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useAppStore } from '@/stores/app'

const store = useAppStore()
const savePath = ref(store.savePath || '')
const filenameFormat = ref('author_id')
const concurrentDownloads = ref(3)
const autoRetry = ref(true)
const retryCount = ref(3)
const cookie = ref('')
const theme = ref('dark')
const primaryColor = ref('#fe2c55')

onMounted(async () => {
  const savedCookie = localStorage.getItem('douyin_cookie')
  if (savedCookie) {
    cookie.value = savedCookie
    await window.electronAPI?.setCookie(savedCookie)
  } else {
    const result = await window.electronAPI?.getCookie()
    if (result?.success && result.data) {
      cookie.value = result.data
    }
  }
})

const themeColors = [
  { name: '抖音红', value: '#fe2c55' },
  { name: '科技蓝', value: '#409eff' },
  { name: '薄荷绿', value: '#25f4ee' },
  { name: '活力橙', value: '#ff9500' },
  { name: '梦幻紫', value: '#a855f7' },
]

const selectSavePath = async () => {
  const path = await window.electronAPI?.selectDirectory()
  if (path) {
    savePath.value = path
    store.savePath = path
    ElMessage.success('保存路径已更新')
  }
}

const saveCookie = async () => {
  if (!cookie.value.trim()) {
    ElMessage.warning('请输入 Cookie')
    return
  }
  localStorage.setItem('douyin_cookie', cookie.value)
  await window.electronAPI?.setCookie(cookie.value)
  ElMessage.success('Cookie 已保存')
}

const clearCookie = async () => {
  cookie.value = ''
  localStorage.removeItem('douyin_cookie')
  await window.electronAPI?.setCookie('')
  ElMessage.success('Cookie 已清除')
}
</script>

<style lang="scss" scoped>
.settings-page {
  max-width: 700px;
  margin: 0 auto;
}

.settings-section {
  padding: 24px;
  margin-bottom: 20px;

  .section-title {
    font-size: 18px;
    font-weight: 700;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--border-color);
  }

  .section-desc {
    font-size: 14px;
    color: var(--text-secondary);
    margin-bottom: 16px;
    line-height: 1.6;
  }
}

.path-input {
  display: flex;
  gap: 10px;
  width: 100%;

  .el-input {
    flex: 1;
  }
}

.slider-label {
  font-size: 13px;
  color: var(--text-secondary);
  margin-left: 12px;
}

.switch-desc {
  font-size: 13px;
  color: var(--text-muted);
  margin-left: 12px;
}

.cookie-steps {
  padding-left: 18px;
  margin: 0;
  font-size: 13px;
  line-height: 1.8;
  color: var(--text-secondary);
}

.color-options {
  display: flex;
  gap: 12px;

  .color-option {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 18px;
    transition: all 0.3s;
    border: 3px solid transparent;

    &.active {
      border-color: var(--text-primary);
      transform: scale(1.1);
    }

    &:hover {
      transform: scale(1.05);
    }
  }
}

.about-info {
  display: flex;
  align-items: center;
  gap: 20px;

  .about-text {
    h2 {
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 4px;
    }

    p {
      font-size: 13px;
      color: var(--text-secondary);
      line-height: 1.6;
    }
  }
}
</style>
