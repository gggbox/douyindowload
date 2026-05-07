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
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import axios from 'axios';
import * as https from 'https';
import { HttpsProxyAgent } from 'https-proxy-agent';
var proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY || process.env.https_proxy || process.env.http_proxy;
var proxyAgent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined;
var httpsAgent = new https.Agent({
    rejectUnauthorized: false,
});
var axiosAgent = proxyAgent || httpsAgent;
var DownloadManager = /** @class */ (function () {
    function DownloadManager() {
        this.downloads = new Map();
        this.listeners = new Map();
    }
    DownloadManager.prototype.startDownload = function (url, filename, savePath) {
        return __awaiter(this, void 0, void 0, function () {
            var id, item;
            return __generator(this, function (_a) {
                id = "dl_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9));
                if (!existsSync(savePath)) {
                    mkdirSync(savePath, { recursive: true });
                }
                item = {
                    id: id,
                    url: url,
                    filename: filename,
                    savePath: savePath,
                    progress: 0,
                    status: 'downloading',
                    totalBytes: 0,
                    receivedBytes: 0,
                };
                this.downloads.set(id, item);
                this.startDownloadProcess(item);
                return [2 /*return*/, id];
            });
        });
    };
    DownloadManager.prototype.startBatchDownload = function (items, savePath) {
        return __awaiter(this, void 0, void 0, function () {
            var ids, _i, items_1, item, id;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ids = [];
                        _i = 0, items_1 = items;
                        _a.label = 1;
                    case 1:
                        if (!(_i < items_1.length)) return [3 /*break*/, 4];
                        item = items_1[_i];
                        return [4 /*yield*/, this.startDownload(item.url, item.filename, savePath)];
                    case 2:
                        id = _a.sent();
                        ids.push(id);
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, ids];
                }
            });
        });
    };
    DownloadManager.prototype.startDownloadProcess = function (item) {
        return __awaiter(this, void 0, void 0, function () {
            var abortController, filePath, response, totalBytes_1, writer_1, receivedBytes_1, error_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        abortController = new AbortController();
                        item.abortController = abortController;
                        filePath = join(item.savePath, item.filename);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, axios({
                                method: 'GET',
                                url: item.url,
                                responseType: 'stream',
                                signal: abortController.signal,
                                headers: {
                                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                                    Referer: 'https://www.douyin.com/',
                                },
                                httpsAgent: axiosAgent,
                            })];
                    case 2:
                        response = _a.sent();
                        totalBytes_1 = parseInt(String(response.headers['content-length'] || '0'), 10);
                        item.totalBytes = totalBytes_1;
                        writer_1 = createWriteStream(filePath);
                        receivedBytes_1 = 0;
                        response.data.on('data', function (chunk) {
                            receivedBytes_1 += chunk.length;
                            item.receivedBytes = receivedBytes_1;
                            item.progress = totalBytes_1 > 0 ? Math.round((receivedBytes_1 / totalBytes_1) * 100) : 0;
                            _this.emit('progress', {
                                id: item.id,
                                progress: item.progress,
                                receivedBytes: item.receivedBytes,
                                totalBytes: item.totalBytes,
                                filename: item.filename,
                            });
                        });
                        response.data.pipe(writer_1);
                        return [4 /*yield*/, new Promise(function (resolve, reject) {
                                writer_1.on('finish', function () {
                                    item.status = 'completed';
                                    item.progress = 100;
                                    _this.emit('complete', {
                                        id: item.id,
                                        filename: item.filename,
                                        savePath: item.savePath,
                                    });
                                    resolve();
                                });
                                writer_1.on('error', reject);
                            })];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _a.sent();
                        if (error_1.name === 'CanceledError' || error_1.name === 'AbortError') {
                            item.status = 'cancelled';
                        }
                        else {
                            item.status = 'error';
                            this.emit('error', {
                                id: item.id,
                                filename: item.filename,
                                error: error_1.message,
                            });
                        }
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    DownloadManager.prototype.cancelDownload = function (id) {
        var _a;
        var item = this.downloads.get(id);
        if (item && item.status === 'downloading') {
            (_a = item.abortController) === null || _a === void 0 ? void 0 : _a.abort();
            item.status = 'cancelled';
        }
    };
    DownloadManager.prototype.on = function (event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    };
    DownloadManager.prototype.emit = function (event, data) {
        var callbacks = this.listeners.get(event) || [];
        callbacks.forEach(function (cb) { return cb(data); });
    };
    return DownloadManager;
}());
export { DownloadManager };
