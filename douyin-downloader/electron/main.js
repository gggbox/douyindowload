var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';
import { join } from 'path';
import { DouyinParser } from './parser';
import { DownloadManager } from './downloader';
var mainWindow = null;
var parser = new DouyinParser();
var downloadManager = new DownloadManager();
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
    });
    if (process.env.NODE_ENV === 'development') {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    }
    else {
        mainWindow.loadFile(join(__dirname, '../dist/index.html'));
    }
    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}
app.whenReady().then(function () {
    createWindow();
    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
ipcMain.handle('parse-url', function (_event, url) { return __awaiter(void 0, void 0, void 0, function () {
    var result, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, parser.parse(url)];
            case 1:
                result = _a.sent();
                return [2 /*return*/, { success: true, data: result }];
            case 2:
                error_1 = _a.sent();
                return [2 /*return*/, { success: false, error: error_1.message }];
            case 3: return [2 /*return*/];
        }
    });
}); });
ipcMain.handle('download-file', function (_event, params) { return __awaiter(void 0, void 0, void 0, function () {
    var id, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, downloadManager.startDownload(params.url, params.filename, params.savePath)];
            case 1:
                id = _a.sent();
                return [2 /*return*/, { success: true, data: { id: id } }];
            case 2:
                error_2 = _a.sent();
                return [2 /*return*/, { success: false, error: error_2.message }];
            case 3: return [2 /*return*/];
        }
    });
}); });
ipcMain.handle('batch-download', function (_event, params) { return __awaiter(void 0, void 0, void 0, function () {
    var ids, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, downloadManager.startBatchDownload(params.items, params.savePath)];
            case 1:
                ids = _a.sent();
                return [2 /*return*/, { success: true, data: { ids: ids } }];
            case 2:
                error_3 = _a.sent();
                return [2 /*return*/, { success: false, error: error_3.message }];
            case 3: return [2 /*return*/];
        }
    });
}); });
ipcMain.handle('select-directory', function () { return __awaiter(void 0, void 0, void 0, function () {
    var result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, dialog.showOpenDialog(mainWindow, {
                    properties: ['openDirectory'],
                    title: '选择保存目录',
                })];
            case 1:
                result = _a.sent();
                if (result.canceled)
                    return [2 /*return*/, null];
                return [2 /*return*/, result.filePaths[0]];
        }
    });
}); });
ipcMain.handle('open-external', function (_event, url) {
    shell.openExternal(url);
});
ipcMain.handle('cancel-download', function (_event, id) {
    downloadManager.cancelDownload(id);
});
ipcMain.handle('fetch-user-profile', function (_event, url) { return __awaiter(void 0, void 0, void 0, function () {
    var result, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, parser.fetchUserProfile(url)];
            case 1:
                result = _a.sent();
                return [2 /*return*/, { success: true, data: result }];
            case 2:
                error_4 = _a.sent();
                return [2 /*return*/, { success: false, error: error_4.message }];
            case 3: return [2 /*return*/];
        }
    });
}); });
ipcMain.handle('fetch-video-list', function (_event, params) { return __awaiter(void 0, void 0, void 0, function () {
    var result, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, parser.fetchVideoList(params.secUid, params.cursor, params.count)];
            case 1:
                result = _a.sent();
                return [2 /*return*/, { success: true, data: result }];
            case 2:
                error_5 = _a.sent();
                return [2 /*return*/, { success: false, error: error_5.message }];
            case 3: return [2 /*return*/];
        }
    });
}); });
ipcMain.handle('set-cookie', function (_event, cookie) {
    parser.setCookie(cookie);
    return { success: true };
});
ipcMain.handle('get-cookie', function () {
    return { success: true, data: parser.getCookie() };
});
ipcMain.handle('window-minimize', function () {
    mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.minimize();
});
ipcMain.handle('window-maximize', function () {
    if (mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.isMaximized()) {
        mainWindow.unmaximize();
    }
    else {
        mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.maximize();
    }
});
ipcMain.handle('window-close', function () {
    mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.close();
});
ipcMain.handle('window-is-maximized', function () {
    return (mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.isMaximized()) || false;
});
downloadManager.on('progress', function (data) {
    mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.webContents.send('download-progress', data);
});
downloadManager.on('complete', function (data) {
    mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.webContents.send('download-complete', data);
});
downloadManager.on('error', function (data) {
    mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.webContents.send('download-error', data);
});
