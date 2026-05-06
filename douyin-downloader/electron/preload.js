import { contextBridge, ipcRenderer } from 'electron';
contextBridge.exposeInMainWorld('electronAPI', {
    parseUrl: function (url) { return ipcRenderer.invoke('parse-url', url); },
    downloadFile: function (params) {
        return ipcRenderer.invoke('download-file', params);
    },
    batchDownload: function (params) {
        return ipcRenderer.invoke('batch-download', params);
    },
    selectDirectory: function () { return ipcRenderer.invoke('select-directory'); },
    openExternal: function (url) { return ipcRenderer.invoke('open-external', url); },
    cancelDownload: function (id) { return ipcRenderer.invoke('cancel-download', id); },
    fetchUserProfile: function (url) { return ipcRenderer.invoke('fetch-user-profile', url); },
    fetchVideoList: function (params) {
        return ipcRenderer.invoke('fetch-video-list', params);
    },
    setCookie: function (cookie) { return ipcRenderer.invoke('set-cookie', cookie); },
    getCookie: function () { return ipcRenderer.invoke('get-cookie'); },
    windowMinimize: function () { return ipcRenderer.invoke('window-minimize'); },
    windowMaximize: function () { return ipcRenderer.invoke('window-maximize'); },
    windowClose: function () { return ipcRenderer.invoke('window-close'); },
    windowIsMaximized: function () { return ipcRenderer.invoke('window-is-maximized'); },
    onDownloadProgress: function (callback) {
        ipcRenderer.on('download-progress', function (_event, data) { return callback(data); });
    },
    onDownloadComplete: function (callback) {
        ipcRenderer.on('download-complete', function (_event, data) { return callback(data); });
    },
    onDownloadError: function (callback) {
        ipcRenderer.on('download-error', function (_event, data) { return callback(data); });
    },
});
