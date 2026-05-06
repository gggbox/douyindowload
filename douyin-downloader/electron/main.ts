import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron'
import { join } from 'path'
import { DouyinParser } from './parser'
import { DownloadManager } from './downloader'

let mainWindow: BrowserWindow | null = null
const parser = new DouyinParser()
const downloadManager = new DownloadManager()

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    frame: false,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#1a1a2e',
      symbolColor: '#e0e0e0',
      height: 36,
    },
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webviewTag: true,
    },
    backgroundColor: '#1a1a2e',
    icon: join(__dirname, '../public/icon.png'),
  })

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

ipcMain.handle('parse-url', async (_event, url: string) => {
  try {
    const result = await parser.parse(url)
    return { success: true, data: result }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle('download-file', async (_event, params: { url: string; filename: string; savePath: string }) => {
  try {
    const id = await downloadManager.startDownload(params.url, params.filename, params.savePath)
    return { success: true, data: { id } }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle('batch-download', async (_event, params: { items: Array<{ url: string; filename: string }>; savePath: string }) => {
  try {
    const ids = await downloadManager.startBatchDownload(params.items, params.savePath)
    return { success: true, data: { ids } }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle('select-directory', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openDirectory'],
    title: '选择保存目录',
  })
  if (result.canceled) return null
  return result.filePaths[0]
})

ipcMain.handle('open-external', (_event, url: string) => {
  shell.openExternal(url)
})

ipcMain.handle('cancel-download', (_event, id: string) => {
  downloadManager.cancelDownload(id)
})

ipcMain.handle('fetch-user-profile', async (_event, url: string) => {
  try {
    const result = await parser.fetchUserProfile(url)
    return { success: true, data: result }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle('fetch-video-list', async (_event, params: { secUid: string; cursor: number; count: number }) => {
  try {
    const result = await parser.fetchVideoList(params.secUid, params.cursor, params.count)
    return { success: true, data: result }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle('set-cookie', (_event, cookie: string) => {
  parser.setCookie(cookie)
  return { success: true }
})

ipcMain.handle('get-cookie', () => {
  return { success: true, data: parser.getCookie() }
})

ipcMain.handle('window-minimize', () => {
  mainWindow?.minimize()
})

ipcMain.handle('window-maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize()
  } else {
    mainWindow?.maximize()
  }
})

ipcMain.handle('window-close', () => {
  mainWindow?.close()
})

ipcMain.handle('window-is-maximized', () => {
  return mainWindow?.isMaximized() || false
})

downloadManager.on('progress', (data) => {
  mainWindow?.webContents.send('download-progress', data)
})

downloadManager.on('complete', (data) => {
  mainWindow?.webContents.send('download-complete', data)
})

downloadManager.on('error', (data) => {
  mainWindow?.webContents.send('download-error', data)
})
