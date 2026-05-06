<template>
  <div class="page-container profile-page">
    <div class="page-header">
      <h1 class="page-title">主页批量下载</h1>
      <p class="page-desc">输入抖音用户主页链接，批量选择下载该用户的视频和图集</p>
    </div>

    <div class="profile-input-section glass-card">
      <div class="input-row">
        <el-input
          v-model="profileUrl"
          placeholder="请输入抖音用户主页链接，如：https://www.douyin.com/user/MS4w..."
          size="large"
          clearable
          @keyup.enter="fetchProfile"
        >
          <template #prefix>
            <el-icon><User /></el-icon>
          </template>
        </el-input>
        <el-button
          type="primary"
          size="large"
          class="douyin-btn"
          :loading="loading"
          @click="fetchProfile"
        >
          <el-icon v-if="!loading"><Search /></el-icon>
          {{ loading ? '获取中...' : '获取主页' }}
        </el-button>
      </div>
    </div>

    <div v-if="userProfile" class="user-profile-card glass-card">
      <div class="profile-info">
        <el-avatar :size="64" :src="userProfile.avatar">
          <el-icon :size="32"><User /></el-icon>
        </el-avatar>
        <div class="profile-details">
          <h2 class="nickname">{{ userProfile.nickname }}</h2>
          <p class="signature">{{ userProfile.signature || '这个人很懒，什么都没写~' }}</p>
          <div class="profile-stats">
            <div class="stat">
              <span class="stat-value">{{ formatNumber(userProfile.stats.followerCount) }}</span>
              <span class="stat-label">粉丝</span>
            </div>
            <div class="stat">
              <span class="stat-value">{{ formatNumber(userProfile.stats.followingCount) }}</span>
              <span class="stat-label">关注</span>
            </div>
            <div class="stat">
              <span class="stat-value">{{ formatNumber(userProfile.stats.awemeCount) }}</span>
              <span class="stat-label">作品</span>
            </div>
            <div class="stat">
              <span class="stat-value">{{ formatNumber(userProfile.stats.favoritingCount) }}</span>
              <span class="stat-label">获赞</span>
            </div>
          </div>
        </div>
      </div>
      <div class="profile-actions">
        <el-button type="primary" class="douyin-btn" @click="loadMoreVideos" :loading="loadingMore">
          <el-icon><Refresh /></el-icon> 加载更多
        </el-button>
        <el-button @click="selectAll" :disabled="videoList.length === 0">
          <el-icon><Check /></el-icon> 全选
        </el-button>
        <el-button @click="invertSelection" :disabled="videoList.length === 0">
          <el-icon><Sort /></el-icon> 反选
        </el-button>
        <el-button
          type="primary"
          class="douyin-btn"
          @click="batchDownload"
          :disabled="selectedCount === 0"
        >
          <el-icon><Download /></el-icon> 下载选中 ({{ selectedCount }})
        </el-button>
      </div>
    </div>

    <div v-if="videoList.length > 0" class="video-list-section">
      <div class="list-header">
        <span class="list-count">共 {{ videoList.length }} 个作品</span>
        <div class="list-filter">
          <el-radio-group v-model="filterType" size="small">
            <el-radio-button label="all">全部</el-radio-button>
            <el-radio-button label="video">视频</el-radio-button>
            <el-radio-button label="images">图集</el-radio-button>
          </el-radio-group>
        </div>
      </div>

      <div class="video-grid">
        <div
          v-for="video in filteredVideos"
          :key="video.id"
          class="video-card glass-card card-hover"
          :class="{ selected: video.selected }"
          @click="toggleSelect(video)"
        >
          <div class="card-cover">
            <el-image :src="video.cover" fit="cover" class="cover-img">
              <template #error>
                <div class="image-placeholder">
                  <el-icon><VideoCamera /></el-icon>
                </div>
              </template>
            </el-image>
            <div class="card-type-badge">
              <el-tag
                :type="video.type === 'video' ? 'danger' : 'success'"
                size="small"
                effect="dark"
                round
              >
                {{ video.type === 'video' ? '视频' : '图集' }}
              </el-tag>
            </div>
            <div v-if="video.type === 'images'" class="card-image-count">
              <el-icon><Picture /></el-icon> {{ video.images?.length }}
            </div>
            <div class="card-checkbox">
              <el-checkbox
                v-model="video.selected"
                @click.stop
                @change="updateSelectedCount"
              />
            </div>
          </div>
          <div class="card-info">
            <p class="card-desc">{{ video.desc || '无描述' }}</p>
            <div class="card-stats">
              <span><el-icon><Star /></el-icon> {{ formatNumber(video.stats.likes) }}</span>
              <span><el-icon><ChatDotRound /></el-icon> {{ formatNumber(video.stats.comments) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="hasMore" class="load-more">
        <el-button @click="loadMoreVideos" :loading="loadingMore" round>
          加载更多作品
        </el-button>
      </div>
    </div>

    <div v-if="!userProfile && !loading" class="empty-tips glass-card">
      <el-icon :size="64" color="#fe2c55"><UserFilled /></el-icon>
      <h3>输入用户主页链接</h3>
      <p>获取用户信息后，可以批量选择下载其发布的视频和图集</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useAppStore } from '@/stores/app'
import type { VideoItem } from '@/stores/app'

const store = useAppStore()
const profileUrl = ref('')
const loading = ref(false)
const loadingMore = ref(false)
const userProfile = ref<any>(null)
const videoList = ref<VideoItem[]>([])
const filterType = ref('all')
const selectedCount = ref(0)
const hasMore = ref(false)
const cursor = ref(0)
const secUid = ref('')

const filteredVideos = computed(() => {
  if (filterType.value === 'all') return videoList.value
  return videoList.value.filter((v) => v.type === filterType.value)
})

const fetchProfile = async () => {
  if (!profileUrl.value.trim()) {
    ElMessage.warning('请输入用户主页链接')
    return
  }

  loading.value = true
  try {
    const profileResult = await window.electronAPI?.fetchUserProfile(profileUrl.value.trim())
    if (profileResult?.success) {
      userProfile.value = profileResult.data
      secUid.value = profileResult.data.secUid
      await loadVideos()
      ElMessage.success('获取用户信息成功')
    } else {
      ElMessage.error(profileResult?.error || '获取用户信息失败')
    }
  } catch (error: any) {
    ElMessage.error(error.message || '网络错误')
  } finally {
    loading.value = false
  }
}

const loadVideos = async () => {
  if (!secUid.value) return

  loadingMore.value = true
  try {
    const result = await window.electronAPI?.fetchVideoList({
      secUid: secUid.value,
      cursor: cursor.value,
      count: 21,
    })

    if (result?.success) {
      const videos = result.data.list.map((v: VideoItem) => ({ ...v, selected: false }))
      videoList.value = [...videoList.value, ...videos]
      hasMore.value = result.data.hasMore
      cursor.value = result.data.cursor
    }
  } catch (error: any) {
    ElMessage.error('加载视频列表失败')
  } finally {
    loadingMore.value = false
  }
}

const loadMoreVideos = () => {
  loadVideos()
}

const toggleSelect = (video: VideoItem) => {
  video.selected = !video.selected
  updateSelectedCount()
}

const selectAll = () => {
  const allSelected = videoList.value.every((v) => v.selected)
  videoList.value.forEach((v) => (v.selected = !allSelected))
  updateSelectedCount()
}

const invertSelection = () => {
  videoList.value.forEach((v) => (v.selected = !v.selected))
  updateSelectedCount()
}

const updateSelectedCount = () => {
  selectedCount.value = videoList.value.filter((v) => v.selected).length
}

const batchDownload = async () => {
  const selected = videoList.value.filter((v) => v.selected)
  if (selected.length === 0) return

  const savePath = store.savePath || (await window.electronAPI?.selectDirectory())
  if (!savePath) return

  store.savePath = savePath

  const items: Array<{ url: string; filename: string }> = []
  selected.forEach((video) => {
    if (video.type === 'video') {
      items.push({
        url: video.videoUrl,
        filename: `${video.author}_${video.id}.mp4`,
      })
    } else if (video.images) {
      video.images.forEach((img, index) => {
        items.push({
          url: img,
          filename: `${video.author}_${video.id}_${index + 1}.jpg`,
        })
      })
    }
  })

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
        type: items[index].filename.endsWith('.mp4') ? 'video' : 'images',
        cover: selected.find((v) =>
          items[index].filename.startsWith(v.author + '_' + v.id)
        )?.cover || '',
        createdAt: Date.now(),
      })
    })
    ElMessage.success(`已添加 ${items.length} 个文件到下载队列`)
  }
}

const formatNumber = (num: number): string => {
  if (num >= 10000) return (num / 10000).toFixed(1) + 'w'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k'
  return num.toString()
}
</script>

<style lang="scss" scoped>
.profile-page {
  max-width: 1200px;
  margin: 0 auto;
}

.profile-input-section {
  padding: 24px;
  margin-bottom: 20px;

  .input-row {
    display: flex;
    gap: 12px;

    .el-input {
      flex: 1;
    }
  }
}

.user-profile-card {
  padding: 24px;
  margin-bottom: 20px;

  .profile-info {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;

    .profile-details {
      flex: 1;

      .nickname {
        font-size: 20px;
        font-weight: 700;
        margin-bottom: 6px;
      }

      .signature {
        font-size: 14px;
        color: var(--text-secondary);
        margin-bottom: 12px;
      }

      .profile-stats {
        display: flex;
        gap: 32px;

        .stat {
          display: flex;
          flex-direction: column;
          align-items: center;

          .stat-value {
            font-size: 18px;
            font-weight: 700;
          }

          .stat-label {
            font-size: 12px;
            color: var(--text-muted);
          }
        }
      }
    }
  }

  .profile-actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }
}

.video-list-section {
  .list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .list-count {
      font-size: 14px;
      color: var(--text-secondary);
    }
  }

  .video-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
  }

  .video-card {
    border-radius: 12px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 2px solid transparent;

    &.selected {
      border-color: var(--accent-primary);
      box-shadow: 0 0 12px rgba(254, 44, 85, 0.3);
    }

    .card-cover {
      position: relative;
      aspect-ratio: 3/4;

      .cover-img {
        width: 100%;
        height: 100%;
      }

      .card-type-badge {
        position: absolute;
        top: 8px;
        left: 8px;
      }

      .card-image-count {
        position: absolute;
        bottom: 8px;
        right: 8px;
        background: rgba(0, 0, 0, 0.6);
        color: white;
        padding: 2px 8px;
        border-radius: 10px;
        font-size: 12px;
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .card-checkbox {
        position: absolute;
        top: 8px;
        right: 8px;

        :deep(.el-checkbox__inner) {
          background: rgba(0, 0, 0, 0.5);
          border-color: rgba(255, 255, 255, 0.5);
        }

        :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
          background: var(--accent-primary);
          border-color: var(--accent-primary);
        }
      }
    }

    .card-info {
      padding: 10px 12px;

      .card-desc {
        font-size: 13px;
        line-height: 1.4;
        color: var(--text-primary);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        margin-bottom: 6px;
      }

      .card-stats {
        display: flex;
        gap: 12px;
        font-size: 12px;
        color: var(--text-muted);

        span {
          display: flex;
          align-items: center;
          gap: 3px;
        }
      }
    }
  }

  .load-more {
    text-align: center;
    padding: 24px;
  }
}

.empty-tips {
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
