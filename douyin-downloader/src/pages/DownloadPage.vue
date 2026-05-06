<template>
  <div class="page-container download-page">
    <div class="page-header">
      <h1 class="page-title">下载管理</h1>
      <p class="page-desc">查看和管理所有下载任务</p>
    </div>

    <div class="download-toolbar glass-card">
      <div class="toolbar-left">
        <el-radio-group v-model="statusFilter" size="small">
          <el-radio-button label="all">全部 ({{ tasks.length }})</el-radio-button>
          <el-radio-button label="downloading">下载中 ({{ downloadingCount }})</el-radio-button>
          <el-radio-button label="completed">已完成 ({{ completedCount }})</el-radio-button>
          <el-radio-button label="error">失败 ({{ errorCount }})</el-radio-button>
        </el-radio-group>
      </div>
      <div class="toolbar-right">
        <el-button size="small" @click="clearCompleted" :disabled="completedCount === 0">
          <el-icon><Delete /></el-icon> 清除已完成
        </el-button>
      </div>
    </div>

    <div v-if="filteredTasks.length > 0" class="download-list">
      <div
        v-for="task in filteredTasks"
        :key="task.id"
        class="download-item glass-card"
        :class="`status-${task.status}`"
      >
        <div class="item-cover">
          <el-image :src="task.cover" fit="cover" class="cover-img">
            <template #error>
              <div class="cover-placeholder">
                <el-icon v-if="task.type === 'video'"><VideoCamera /></el-icon>
                <el-icon v-else><Picture /></el-icon>
              </div>
            </template>
          </el-image>
        </div>

        <div class="item-info">
          <div class="info-top">
            <span class="info-filename">{{ task.filename }}</span>
            <el-tag
              :type="getStatusType(task.status)"
              size="small"
              effect="dark"
              round
            >
              {{ getStatusText(task.status) }}
            </el-tag>
          </div>

          <div class="info-progress">
            <el-progress
              :percentage="task.progress"
              :status="getProgressStatus(task.status)"
              :stroke-width="6"
              :show-text="false"
            />
            <span class="progress-text">
              {{ task.progress }}%
              <span v-if="task.status === 'downloading'" class="progress-speed">
                {{ formatSize(task.receivedBytes) }} / {{ formatSize(task.totalBytes) }}
              </span>
            </span>
          </div>

          <div class="info-meta">
            <span class="meta-type">
              <el-icon v-if="task.type === 'video'"><VideoCamera /></el-icon>
              <el-icon v-else><Picture /></el-icon>
              {{ task.type === 'video' ? '视频' : '图集' }}
            </span>
            <span class="meta-path">{{ task.savePath }}</span>
            <span class="meta-time">{{ formatTime(task.createdAt) }}</span>
          </div>
        </div>

        <div class="item-actions">
          <el-button
            v-if="task.status === 'downloading'"
            type="danger"
            size="small"
            circle
            @click="cancelTask(task.id)"
          >
            <el-icon><Close /></el-icon>
          </el-button>
          <el-button
            v-if="task.status === 'error'"
            type="primary"
            size="small"
            circle
            @click="retryTask(task)"
          >
            <el-icon><RefreshRight /></el-icon>
          </el-button>
          <el-button
            v-if="task.status === 'completed'"
            type="primary"
            size="small"
            circle
            @click="openFile(task)"
          >
            <el-icon><FolderOpened /></el-icon>
          </el-button>
          <el-button
            type="danger"
            size="small"
            circle
            plain
            @click="removeTask(task.id)"
          >
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>
      </div>
    </div>

    <div v-else class="empty-state glass-card">
      <el-icon :size="64" color="#fe2c55"><Download /></el-icon>
      <h3>暂无下载任务</h3>
      <p>去「链接解析」或「主页批量」页面开始下载吧</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAppStore } from '@/stores/app'
import type { DownloadTask } from '@/stores/app'

const store = useAppStore()
const statusFilter = ref('all')

const tasks = computed(() => store.downloadTasks)

const filteredTasks = computed(() => {
  if (statusFilter.value === 'all') return tasks.value
  return tasks.value.filter((t) => t.status === statusFilter.value)
})

const downloadingCount = computed(() => tasks.value.filter((t) => t.status === 'downloading').length)
const completedCount = computed(() => tasks.value.filter((t) => t.status === 'completed').length)
const errorCount = computed(() => tasks.value.filter((t) => t.status === 'error').length)

const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    downloading: 'primary',
    completed: 'success',
    error: 'danger',
    cancelled: 'info',
    pending: 'warning',
  }
  return map[status] || 'info'
}

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    downloading: '下载中',
    completed: '已完成',
    error: '失败',
    cancelled: '已取消',
    pending: '等待中',
  }
  return map[status] || status
}

const getProgressStatus = (status: string) => {
  if (status === 'completed') return 'success'
  if (status === 'error') return 'exception'
  return undefined
}

const cancelTask = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要取消此下载任务吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await window.electronAPI?.cancelDownload(id)
    store.updateDownloadTask(id, { status: 'cancelled' })
    ElMessage.success('已取消下载')
  } catch {
    // cancelled
  }
}

const retryTask = async (task: DownloadTask) => {
  const result = await window.electronAPI?.downloadFile({
    url: task.url,
    filename: task.filename,
    savePath: task.savePath,
  })

  if (result?.success) {
    store.removeDownloadTask(task.id)
    store.addDownloadTask({
      ...task,
      id: result.data.id,
      progress: 0,
      status: 'downloading',
      receivedBytes: 0,
      totalBytes: 0,
    })
    ElMessage.success('已重新开始下载')
  }
}

const openFile = (task: DownloadTask) => {
  window.electronAPI?.openExternal(task.savePath)
}

const removeTask = (id: string) => {
  store.removeDownloadTask(id)
}

const clearCompleted = () => {
  store.clearCompletedTasks()
  ElMessage.success('已清除已完成的任务')
}

const formatSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + units[i]
}

const formatTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString('zh-CN')
}
</script>

<style lang="scss" scoped>
.download-page {
  max-width: 1000px;
  margin: 0 auto;
}

.download-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  margin-bottom: 16px;
}

.download-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.download-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  transition: all 0.3s;

  &.status-error {
    border-left: 3px solid #f56c6c;
  }

  &.status-downloading {
    border-left: 3px solid #409eff;
  }

  &.status-completed {
    border-left: 3px solid #67c23a;
  }

  .item-cover {
    width: 64px;
    height: 64px;
    border-radius: 8px;
    overflow: hidden;
    flex-shrink: 0;

    .cover-img {
      width: 100%;
      height: 100%;
    }

    .cover-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-tertiary);
      color: var(--text-muted);
      font-size: 24px;
    }
  }

  .item-info {
    flex: 1;
    min-width: 0;

    .info-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;

      .info-filename {
        font-size: 14px;
        font-weight: 500;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        max-width: 400px;
      }
    }

    .info-progress {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;

      .el-progress {
        flex: 1;
      }

      .progress-text {
        font-size: 12px;
        color: var(--text-secondary);
        white-space: nowrap;

        .progress-speed {
          color: var(--text-muted);
          margin-left: 4px;
        }
      }
    }

    .info-meta {
      display: flex;
      gap: 16px;
      font-size: 12px;
      color: var(--text-muted);

      span {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .meta-path {
        max-width: 200px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }

  .item-actions {
    display: flex;
    gap: 6px;
    flex-shrink: 0;
  }
}

.empty-state {
  padding: 60px 40px;
  text-align: center;

  h3 {
    margin: 16px 0 8px;
    font-size: 18px;
    color: var(--text-primary);
  }

  p {
    color: var(--text-secondary);
    font-size: 14px;
  }
}
</style>
