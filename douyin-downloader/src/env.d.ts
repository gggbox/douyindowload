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
    selectDirectory: () => Promise<string | null>
    openExternal: (url: string) => void
    getDownloadProgress: (id: string) => Promise<any>
    cancelDownload: (id: string) => Promise<void>
    onDownloadProgress: (callback: (progress: any) => void) => void
    onDownloadComplete: (callback: (result: any) => void) => void
    fetchUserProfile: (url: string) => Promise<any>
    fetchVideoList: (secUid: string, cursor: number) => Promise<any>
  }
}
