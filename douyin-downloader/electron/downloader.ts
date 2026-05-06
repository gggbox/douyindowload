import { app } from 'electron'
import { createWriteStream, existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import axios from 'axios'
import * as https from 'https'

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
})

interface DownloadItem {
  id: string
  url: string
  filename: string
  savePath: string
  progress: number
  status: 'downloading' | 'completed' | 'error' | 'cancelled'
  totalBytes: number
  receivedBytes: number
  abortController?: AbortController
}

type DownloadEventCallback = (data: any) => void

export class DownloadManager {
  private downloads: Map<string, DownloadItem> = new Map()
  private listeners: Map<string, DownloadEventCallback[]> = new Map()

  async startDownload(url: string, filename: string, savePath: string): Promise<string> {
    const id = `dl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    if (!existsSync(savePath)) {
      mkdirSync(savePath, { recursive: true })
    }

    const item: DownloadItem = {
      id,
      url,
      filename,
      savePath,
      progress: 0,
      status: 'downloading',
      totalBytes: 0,
      receivedBytes: 0,
    }

    this.downloads.set(id, item)
    this.startDownloadProcess(item)

    return id
  }

  async startBatchDownload(
    items: Array<{ url: string; filename: string }>,
    savePath: string
  ): Promise<string[]> {
    const ids: string[] = []
    for (const item of items) {
      const id = await this.startDownload(item.url, item.filename, savePath)
      ids.push(id)
    }
    return ids
  }

  private async startDownloadProcess(item: DownloadItem) {
    const abortController = new AbortController()
    item.abortController = abortController
    const filePath = join(item.savePath, item.filename)

    try {
      const response = await axios({
        method: 'GET',
        url: item.url,
        responseType: 'stream',
        signal: abortController.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Referer: 'https://www.douyin.com/',
        },
        httpsAgent,
      })

      const totalBytes = parseInt(response.headers['content-length'] || '0', 10)
      item.totalBytes = totalBytes

      const writer = createWriteStream(filePath)
      let receivedBytes = 0

      response.data.on('data', (chunk: Buffer) => {
        receivedBytes += chunk.length
        item.receivedBytes = receivedBytes
        item.progress = totalBytes > 0 ? Math.round((receivedBytes / totalBytes) * 100) : 0

        this.emit('progress', {
          id: item.id,
          progress: item.progress,
          receivedBytes: item.receivedBytes,
          totalBytes: item.totalBytes,
          filename: item.filename,
        })
      })

      response.data.pipe(writer)

      await new Promise<void>((resolve, reject) => {
        writer.on('finish', () => {
          item.status = 'completed'
          item.progress = 100
          this.emit('complete', {
            id: item.id,
            filename: item.filename,
            savePath: item.savePath,
          })
          resolve()
        })
        writer.on('error', reject)
      })
    } catch (error: any) {
      if (error.name === 'CanceledError' || error.name === 'AbortError') {
        item.status = 'cancelled'
      } else {
        item.status = 'error'
        this.emit('error', {
          id: item.id,
          filename: item.filename,
          error: error.message,
        })
      }
    }
  }

  cancelDownload(id: string) {
    const item = this.downloads.get(id)
    if (item && item.status === 'downloading') {
      item.abortController?.abort()
      item.status = 'cancelled'
    }
  }

  on(event: string, callback: DownloadEventCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(callback)
  }

  private emit(event: string, data: any) {
    const callbacks = this.listeners.get(event) || []
    callbacks.forEach((cb) => cb(data))
  }
}
