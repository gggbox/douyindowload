/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface Window {
  electronAPI: {
    parseUrl: (url: string) => Promise<any>
    downloadFile: (params: { url: string; filename: string; savePath: string }) => Promise<any>
    batchDownload: (params: { items: Array<{ url: string; filename: string }>; savePath: string }) => Promise<any>
    selectDirectory: () => Promise<string | null>
    openExternal: (url: string) => Promise<void>
    cancelDownload: (id: string) => Promise<void>
    onDownloadProgress: (callback: (progress: any) => void) => void
    onDownloadComplete: (callback: (result: any) => void) => void
    onDownloadError: (callback: (result: any) => void) => void
    fetchUserProfile: (url: string) => Promise<any>
    fetchVideoList: (params: { secUid: string; cursor: number; count: number }) => Promise<any>
    setCookie: (cookie: string) => Promise<any>
    getCookie: () => Promise<any>
    windowMinimize: () => Promise<void>
    windowMaximize: () => Promise<void>
    windowClose: () => Promise<void>
    windowIsMaximized: () => Promise<boolean>
  }
}
