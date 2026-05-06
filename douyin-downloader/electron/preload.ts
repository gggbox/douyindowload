import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  parseUrl: (url: string) => ipcRenderer.invoke('parse-url', url),
  downloadFile: (params: { url: string; filename: string; savePath: string }) =>
    ipcRenderer.invoke('download-file', params),
  batchDownload: (params: { items: Array<{ url: string; filename: string }>; savePath: string }) =>
    ipcRenderer.invoke('batch-download', params),
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  openExternal: (url: string) => ipcRenderer.invoke('open-external', url),
  cancelDownload: (id: string) => ipcRenderer.invoke('cancel-download', id),
  fetchUserProfile: (url: string) => ipcRenderer.invoke('fetch-user-profile', url),
  fetchVideoList: (params: { secUid: string; cursor: number; count: number }) =>
    ipcRenderer.invoke('fetch-video-list', params),
  setCookie: (cookie: string) => ipcRenderer.invoke('set-cookie', cookie),
  getCookie: () => ipcRenderer.invoke('get-cookie'),
  windowMinimize: () => ipcRenderer.invoke('window-minimize'),
  windowMaximize: () => ipcRenderer.invoke('window-maximize'),
  windowClose: () => ipcRenderer.invoke('window-close'),
  windowIsMaximized: () => ipcRenderer.invoke('window-is-maximized'),
  onDownloadProgress: (callback: (progress: any) => void) => {
    ipcRenderer.on('download-progress', (_event, data) => callback(data))
  },
  onDownloadComplete: (callback: (result: any) => void) => {
    ipcRenderer.on('download-complete', (_event, data) => callback(data))
  },
  onDownloadError: (callback: (result: any) => void) => {
    ipcRenderer.on('download-error', (_event, data) => callback(data))
  },
})
