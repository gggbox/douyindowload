<template>
  <div class="app-layout">
    <div class="title-bar">
      <div class="title-bar-drag">
        <div class="app-logo">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" fill="#FE2C55"/>
          </svg>
          <span class="app-name">抖音下载器</span>
        </div>
      </div>
      <div class="title-bar-actions">
        <span class="action-btn minimize" @click="minimize">
          <el-icon><Minus /></el-icon>
        </span>
        <span class="action-btn maximize" @click="maximize">
          <el-icon><FullScreen /></el-icon>
        </span>
        <span class="action-btn close" @click="closeApp">
          <el-icon><Close /></el-icon>
        </span>
      </div>
    </div>

    <div class="app-body">
      <aside class="sidebar">
        <el-menu
          :default-active="currentRoute"
          class="sidebar-menu"
          @select="handleMenuSelect"
          background-color="transparent"
          text-color="#a0a0b8"
          active-text-color="#fe2c55"
        >
          <el-menu-item index="/parse">
            <el-icon><Link /></el-icon>
            <span>链接解析</span>
          </el-menu-item>
          <el-menu-item index="/profile">
            <el-icon><User /></el-icon>
            <span>主页批量</span>
          </el-menu-item>
          <el-menu-item index="/browser">
            <el-icon><Monitor /></el-icon>
            <span>内嵌浏览</span>
          </el-menu-item>
          <el-menu-item index="/downloads">
            <el-icon><Download /></el-icon>
            <span>下载管理</span>
            <el-badge v-if="downloadingCount > 0" :value="downloadingCount" class="download-badge" />
          </el-menu-item>

          <div class="sidebar-divider"></div>

          <el-menu-item index="/settings">
            <el-icon><Setting /></el-icon>
            <span>设置</span>
          </el-menu-item>
        </el-menu>

        <div class="sidebar-footer">
          <div class="version-info">v1.0.0</div>
        </div>
      </aside>

      <main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'

const router = useRouter()
const route = useRoute()
const store = useAppStore()

const currentRoute = computed(() => route.path)
const downloadingCount = computed(
  () => store.downloadTasks.filter((t) => t.status === 'downloading').length
)

const handleMenuSelect = (index: string) => {
  router.push(index)
}

const minimize = () => {
  window.electronAPI?.windowMinimize()
}

const maximize = () => {
  window.electronAPI?.windowMaximize()
}

const closeApp = () => {
  window.electronAPI?.windowClose()
}

onMounted(() => {
  window.electronAPI?.onDownloadProgress((data: any) => {
    store.updateDownloadTask(data.id, {
      progress: data.progress,
      receivedBytes: data.receivedBytes,
      totalBytes: data.totalBytes,
    })
  })

  window.electronAPI?.onDownloadComplete((data: any) => {
    store.updateDownloadTask(data.id, {
      status: 'completed',
      progress: 100,
    })
  })

  window.electronAPI?.onDownloadError((data: any) => {
    store.updateDownloadTask(data.id, {
      status: 'error',
    })
  })
})
</script>

<style lang="scss" scoped>
.app-layout {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
}

.title-bar {
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  -webkit-app-region: drag;
  user-select: none;
  flex-shrink: 0;

  .title-bar-drag {
    flex: 1;
    display: flex;
    align-items: center;
    padding-left: 12px;
  }

  .app-logo {
    display: flex;
    align-items: center;
    gap: 8px;

    .app-name {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-primary);
      letter-spacing: 0.5px;
    }
  }

  .title-bar-actions {
    display: flex;
    height: 100%;
    -webkit-app-region: no-drag;

    .action-btn {
      width: 46px;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--text-secondary);
      transition: all 0.2s;

      &:hover {
        background: var(--bg-tertiary);
        color: var(--text-primary);
      }

      &.close:hover {
        background: #e81123;
        color: white;
      }
    }
  }
}

.app-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.sidebar {
  width: 200px;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;

  .sidebar-menu {
    flex: 1;
    padding: 8px;

    .el-menu-item {
      height: 44px;
      line-height: 44px;
      border-radius: 8px;
      margin-bottom: 4px;
      font-size: 14px;

      &.is-active {
        background: rgba(254, 44, 85, 0.1) !important;
        font-weight: 600;

        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 20px;
          background: var(--accent-primary);
          border-radius: 0 3px 3px 0;
        }
      }

      .el-icon {
        font-size: 18px;
        margin-right: 10px;
      }
    }
  }

  .sidebar-divider {
    height: 1px;
    background: var(--border-color);
    margin: 8px 12px;
  }

  .sidebar-footer {
    padding: 12px 16px;
    border-top: 1px solid var(--border-color);

    .version-info {
      font-size: 12px;
      color: var(--text-muted);
      text-align: center;
    }
  }
}

.download-badge {
  margin-left: auto;

  :deep(.el-badge__content) {
    font-size: 10px;
  }
}

.main-content {
  flex: 1;
  overflow: hidden;
  background: var(--bg-primary);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
