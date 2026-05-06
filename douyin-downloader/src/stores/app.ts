import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'

export interface VideoItem {
  id: string
  desc: string
  author: string
  authorAvatar: string
  cover: string
  videoUrl: string
  musicUrl?: string
  images?: string[]
  type: 'video' | 'images'
  stats: {
    likes: number
    comments: number
    shares: number
  }
  createTime: number
  selected?: boolean
}

export interface DownloadTask {
  id: string
  filename: string
  url: string
  savePath: string
  progress: number
  status: 'downloading' | 'completed' | 'error' | 'cancelled' | 'pending'
  totalBytes: number
  receivedBytes: number
  type: 'video' | 'images'
  cover: string
  createdAt: number
}

export const useAppStore = defineStore('app', () => {
  const currentVideo = ref<VideoItem | null>(null)
  const profileVideos = ref<VideoItem[]>([])
  const downloadTasks = ref<DownloadTask[]>([])
  const savePath = ref('')

  const addDownloadTask = (task: DownloadTask) => {
    downloadTasks.value.unshift(task)
  }

  const updateDownloadTask = (id: string, updates: Partial<DownloadTask>) => {
    const index = downloadTasks.value.findIndex((t) => t.id === id)
    if (index !== -1) {
      downloadTasks.value[index] = { ...downloadTasks.value[index], ...updates }
    }
  }

  const removeDownloadTask = (id: string) => {
    downloadTasks.value = downloadTasks.value.filter((t) => t.id !== id)
  }

  const clearCompletedTasks = () => {
    downloadTasks.value = downloadTasks.value.filter((t) => t.status !== 'completed')
  }

  return {
    currentVideo,
    profileVideos,
    downloadTasks,
    savePath,
    addDownloadTask,
    updateDownloadTask,
    removeDownloadTask,
    clearCompletedTasks,
  }
})
