var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
import axios from 'axios';
import * as https from 'https';
import { HttpsProxyAgent } from 'https-proxy-agent';
var proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY || process.env.https_proxy || process.env.http_proxy;
var proxyAgent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined;
var httpsAgent = new https.Agent({
    rejectUnauthorized: false,
});
var axiosAgent = proxyAgent || httpsAgent;
var headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    Referer: 'https://www.douyin.com/',
    Cookie: '',
};
var DouyinParser = /** @class */ (function () {
    function DouyinParser() {
        this.cookie = '';
    }
    DouyinParser.prototype.setCookie = function (cookie) {
        this.cookie = cookie;
        headers.Cookie = cookie;
    };
    DouyinParser.prototype.getCookie = function () {
        return this.cookie;
    };
    DouyinParser.prototype.parse = function (input) {
        return __awaiter(this, void 0, void 0, function () {
            var extractedUrl, shareCode, redirectUrl, videoId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        extractedUrl = this.extractUrlFromText(input);
                        if (!extractedUrl.startsWith('http')) {
                            shareCode = this.extractShareCode(input);
                            if (shareCode) {
                                throw new Error('检测到抖音口令分享文本，但未找到链接地址。\n' +
                                    '请在抖音中使用「复制链接」而非「复制口令」来分享，或在分享文本中包含 https://v.douyin.com/xxx/ 格式的链接。');
                            }
                            throw new Error('未检测到有效的链接，请粘贴包含 https://v.douyin.com/ 链接的分享文本');
                        }
                        return [4 /*yield*/, this.resolveShortUrl(extractedUrl)];
                    case 1:
                        redirectUrl = _a.sent();
                        videoId = this.extractVideoId(redirectUrl);
                        if (!videoId) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.fetchVideoDetail(videoId)];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3: throw new Error('无法从链接中提取视频ID，请确认链接是否正确');
                }
            });
        });
    };
    DouyinParser.prototype.extractUrlFromText = function (text) {
        var douyinShortUrlRegex = /https?:\/\/v\.douyin\.com\/[a-zA-Z0-9]+\/?/;
        var shortMatch = text.match(douyinShortUrlRegex);
        if (shortMatch)
            return shortMatch[0];
        var douyinLongUrlRegex = /https?:\/\/www\.douyin\.com\/[^\s\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]+/;
        var longMatch = text.match(douyinLongUrlRegex);
        if (longMatch)
            return longMatch[0];
        var iesdouyinUrlRegex = /https?:\/\/www\.iesdouyin\.com\/[^\s\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]+/;
        var iesMatch = text.match(iesdouyinUrlRegex);
        if (iesMatch)
            return iesMatch[0];
        var tiktokUrlRegex = /https?:\/\/(?:vt\.tiktok\.com|www\.tiktok\.com)\/[^\s\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]+/;
        var tiktokMatch = text.match(tiktokUrlRegex);
        if (tiktokMatch)
            return tiktokMatch[0];
        var generalUrlRegex = /https?:\/\/[^\s\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]+/;
        var generalMatch = text.match(generalUrlRegex);
        if (generalMatch)
            return generalMatch[0];
        return text.trim();
    };
    DouyinParser.prototype.extractShareCode = function (text) {
        var shareCodeRegex = /[a-zA-Z0-9@._]+\s*[a-zA-Z0-9]+:\/\s/;
        var match = text.match(shareCodeRegex);
        if (match)
            return match[0].trim();
        if (text.includes('复制此链接') ||
            text.includes('打开Dou音') ||
            text.includes('打开抖音') ||
            text.includes('直接观看')) {
            return text.substring(0, 50);
        }
        return null;
    };
    DouyinParser.prototype.resolveShortUrl = function (url) {
        return __awaiter(this, void 0, void 0, function () {
            var response, location_1, videoId, error_1, location_2, videoId, response, location_3, videoId, error_2, location_4, videoId, response, finalUrl, _a;
            var _b, _c, _d, _e, _f, _g;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        if (!url.includes('v.douyin.com') && !url.includes('vt.tiktok.com') && !url.includes('iesdouyin.com')) {
                            return [2 /*return*/, url];
                        }
                        _h.label = 1;
                    case 1:
                        _h.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, axios.get(url, {
                                maxRedirects: 0,
                                headers: __assign(__assign({}, headers), { Cookie: this.cookie }),
                                httpsAgent: axiosAgent,
                                validateStatus: function (status) { return status >= 200 && status < 400; },
                            })];
                    case 2:
                        response = _h.sent();
                        location_1 = response.headers['location'];
                        if (location_1) {
                            videoId = this.extractVideoId(location_1);
                            if (videoId)
                                return [2 /*return*/, location_1];
                            return [2 /*return*/, this.resolveShortUrl(location_1)];
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _h.sent();
                        if ((_c = (_b = error_1.response) === null || _b === void 0 ? void 0 : _b.headers) === null || _c === void 0 ? void 0 : _c.location) {
                            location_2 = error_1.response.headers.location;
                            videoId = this.extractVideoId(location_2);
                            if (videoId)
                                return [2 /*return*/, location_2];
                            return [2 /*return*/, this.resolveShortUrl(location_2)];
                        }
                        return [3 /*break*/, 4];
                    case 4:
                        _h.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, axios.head(url, {
                                maxRedirects: 0,
                                headers: __assign(__assign({}, headers), { Cookie: this.cookie }),
                                httpsAgent: axiosAgent,
                                validateStatus: function (status) { return status >= 200 && status < 400; },
                            })];
                    case 5:
                        response = _h.sent();
                        location_3 = response.headers['location'];
                        if (location_3) {
                            videoId = this.extractVideoId(location_3);
                            if (videoId)
                                return [2 /*return*/, location_3];
                            return [2 /*return*/, this.resolveShortUrl(location_3)];
                        }
                        return [3 /*break*/, 7];
                    case 6:
                        error_2 = _h.sent();
                        if ((_e = (_d = error_2.response) === null || _d === void 0 ? void 0 : _d.headers) === null || _e === void 0 ? void 0 : _e.location) {
                            location_4 = error_2.response.headers.location;
                            videoId = this.extractVideoId(location_4);
                            if (videoId)
                                return [2 /*return*/, location_4];
                            return [2 /*return*/, this.resolveShortUrl(location_4)];
                        }
                        return [3 /*break*/, 7];
                    case 7:
                        _h.trys.push([7, 9, , 10]);
                        return [4 /*yield*/, axios.get(url, {
                                maxRedirects: 5,
                                headers: __assign(__assign({}, headers), { Cookie: this.cookie }),
                                httpsAgent: axiosAgent,
                                validateStatus: function () { return true; },
                            })];
                    case 8:
                        response = _h.sent();
                        finalUrl = (_g = (_f = response.request) === null || _f === void 0 ? void 0 : _f.res) === null || _g === void 0 ? void 0 : _g.responseUrl;
                        if (finalUrl && finalUrl !== url) {
                            return [2 /*return*/, finalUrl];
                        }
                        return [3 /*break*/, 10];
                    case 9:
                        _a = _h.sent();
                        return [3 /*break*/, 10];
                    case 10: return [2 /*return*/, url];
                }
            });
        });
    };
    DouyinParser.prototype.extractVideoId = function (url) {
        var patterns = [
            /video\/(\d+)/,
            /note\/(\d+)/,
            /share\/video\/(\d+)/,
            /modal_id=(\d+)/,
            /aweme_id=(\d+)/,
            /\/(\d{19})/,
        ];
        for (var _i = 0, patterns_1 = patterns; _i < patterns_1.length; _i++) {
            var pattern = patterns_1[_i];
            var match = url.match(pattern);
            if (match)
                return match[1];
        }
        return null;
    };
    DouyinParser.prototype.fetchVideoDetail = function (videoId) {
        return __awaiter(this, void 0, void 0, function () {
            var apiUrl, response, data, _a, shareUrl, response, html, renderDataMatch, decoded, jsonData, detail, routerDataMatch, jsonData, detail, _b, iesUrl, response, html, routerDataMatch, jsonData, videoInfoRes, itemList, renderDataMatch, decoded, jsonData, detail, _c;
            var _d, _e, _f, _g, _h, _j;
            return __generator(this, function (_k) {
                switch (_k.label) {
                    case 0:
                        apiUrl = "https://www.douyin.com/aweme/v1/web/aweme/detail/?aweme_id=".concat(videoId, "&aid=6383&cookie_enabled=true");
                        _k.label = 1;
                    case 1:
                        _k.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, axios.get(apiUrl, {
                                headers: __assign(__assign({}, headers), { Cookie: this.cookie }),
                                httpsAgent: axiosAgent,
                                timeout: 10000,
                            })];
                    case 2:
                        response = _k.sent();
                        data = response.data;
                        if (data === null || data === void 0 ? void 0 : data.aweme_detail) {
                            return [2 /*return*/, this.parseVideoDetail(data.aweme_detail)];
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        _a = _k.sent();
                        return [3 /*break*/, 4];
                    case 4:
                        _k.trys.push([4, 6, , 7]);
                        shareUrl = "https://www.douyin.com/video/".concat(videoId);
                        return [4 /*yield*/, axios.get(shareUrl, {
                                headers: __assign(__assign({}, headers), { Cookie: this.cookie, 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' }),
                                httpsAgent: axiosAgent,
                                timeout: 10000,
                            })];
                    case 5:
                        response = _k.sent();
                        html = typeof response.data === 'string' ? response.data : '';
                        renderDataMatch = html.match(/<script\s+id="RENDER_DATA"\s+type="application\/json">([^<]+)<\/script>/);
                        if (renderDataMatch) {
                            decoded = decodeURIComponent(renderDataMatch[1]);
                            jsonData = JSON.parse(decoded);
                            detail = ((_d = jsonData === null || jsonData === void 0 ? void 0 : jsonData[Object.keys(jsonData)[0]]) === null || _d === void 0 ? void 0 : _d.awemeDetail) || (jsonData === null || jsonData === void 0 ? void 0 : jsonData.awemeDetail);
                            if (detail) {
                                return [2 /*return*/, this.parseVideoDetail(detail)];
                            }
                        }
                        routerDataMatch = html.match(/window\._ROUTER_DATA\s*=\s*(\{.+?\})\s*<\/script>/);
                        if (routerDataMatch) {
                            jsonData = JSON.parse(routerDataMatch[1]);
                            detail = (_f = (_e = jsonData === null || jsonData === void 0 ? void 0 : jsonData.loaderData) === null || _e === void 0 ? void 0 : _e.videoDetail) === null || _f === void 0 ? void 0 : _f.awemeDetail;
                            if (detail) {
                                return [2 /*return*/, this.parseVideoDetail(detail)];
                            }
                        }
                        return [3 /*break*/, 7];
                    case 6:
                        _b = _k.sent();
                        return [3 /*break*/, 7];
                    case 7:
                        _k.trys.push([7, 9, , 10]);
                        iesUrl = "https://www.iesdouyin.com/share/video/".concat(videoId, "/");
                        return [4 /*yield*/, axios.get(iesUrl, {
                                headers: __assign(__assign({}, headers), { 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1', 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' }),
                                httpsAgent: axiosAgent,
                                maxRedirects: 5,
                                timeout: 10000,
                            })];
                    case 8:
                        response = _k.sent();
                        html = typeof response.data === 'string' ? response.data : '';
                        routerDataMatch = html.match(/window\._ROUTER_DATA\s*=\s*(\{.+?\})\s*<\/script>/);
                        if (routerDataMatch) {
                            try {
                                jsonData = JSON.parse(routerDataMatch[1]);
                                videoInfoRes = (_h = (_g = jsonData === null || jsonData === void 0 ? void 0 : jsonData.loaderData) === null || _g === void 0 ? void 0 : _g['video_(id)/page']) === null || _h === void 0 ? void 0 : _h.videoInfoRes;
                                itemList = videoInfoRes === null || videoInfoRes === void 0 ? void 0 : videoInfoRes.item_list;
                                if (itemList && itemList.length > 0) {
                                    return [2 /*return*/, this.parseVideoDetail(itemList[0])];
                                }
                            }
                            catch (_l) {
                                // parse error
                            }
                        }
                        renderDataMatch = html.match(/<script\s+id="RENDER_DATA"\s+type="application\/json">([^<]+)<\/script>/);
                        if (renderDataMatch) {
                            decoded = decodeURIComponent(renderDataMatch[1]);
                            jsonData = JSON.parse(decoded);
                            detail = ((_j = jsonData === null || jsonData === void 0 ? void 0 : jsonData[Object.keys(jsonData)[0]]) === null || _j === void 0 ? void 0 : _j.awemeDetail) || (jsonData === null || jsonData === void 0 ? void 0 : jsonData.awemeDetail);
                            if (detail) {
                                return [2 /*return*/, this.parseVideoDetail(detail)];
                            }
                        }
                        return [3 /*break*/, 10];
                    case 9:
                        _c = _k.sent();
                        return [3 /*break*/, 10];
                    case 10: throw new Error('获取视频详情失败。可能原因：\n' +
                        '1. 未设置Cookie - 请在设置页面填入抖音网页版Cookie\n' +
                        '2. 视频已被删除或设为私密\n' +
                        '3. 网络连接问题');
                }
            });
        });
    };
    DouyinParser.prototype.parseVideoDetail = function (detail) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0;
        var isImagePost = detail.images && detail.images.length > 0;
        var videoUrl = '';
        if (detail.video) {
            videoUrl =
                ((_b = (_a = detail.video.play_addr) === null || _a === void 0 ? void 0 : _a.url_list) === null || _b === void 0 ? void 0 : _b[0]) ||
                    ((_d = (_c = detail.video.play_addr_265) === null || _c === void 0 ? void 0 : _c.url_list) === null || _d === void 0 ? void 0 : _d[0]) ||
                    ((_f = (_e = detail.video.play_addr_h264) === null || _e === void 0 ? void 0 : _e.url_list) === null || _f === void 0 ? void 0 : _f[0]) ||
                    '';
            if (videoUrl && !videoUrl.startsWith('http')) {
                videoUrl = 'https:' + videoUrl;
            }
        }
        var cover = '';
        if (detail.video) {
            cover =
                ((_h = (_g = detail.video.cover) === null || _g === void 0 ? void 0 : _g.url_list) === null || _h === void 0 ? void 0 : _h[0]) ||
                    ((_k = (_j = detail.video.dynamic_cover) === null || _j === void 0 ? void 0 : _j.url_list) === null || _k === void 0 ? void 0 : _k[0]) ||
                    ((_m = (_l = detail.video.origin_cover) === null || _l === void 0 ? void 0 : _l.url_list) === null || _m === void 0 ? void 0 : _m[0]) ||
                    '';
            if (cover && !cover.startsWith('http')) {
                cover = 'https:' + cover;
            }
        }
        var authorAvatar = '';
        if (detail.author) {
            authorAvatar =
                ((_p = (_o = detail.author.avatar_larger) === null || _o === void 0 ? void 0 : _o.url_list) === null || _p === void 0 ? void 0 : _p[0]) ||
                    ((_r = (_q = detail.author.avatar_medium) === null || _q === void 0 ? void 0 : _q.url_list) === null || _r === void 0 ? void 0 : _r[0]) ||
                    ((_t = (_s = detail.author.avatar_thumb) === null || _s === void 0 ? void 0 : _s.url_list) === null || _t === void 0 ? void 0 : _t[0]) ||
                    '';
            if (authorAvatar && !authorAvatar.startsWith('http')) {
                authorAvatar = 'https:' + authorAvatar;
            }
        }
        var musicUrl;
        if ((_w = (_v = (_u = detail.music) === null || _u === void 0 ? void 0 : _u.play_url) === null || _v === void 0 ? void 0 : _v.url_list) === null || _w === void 0 ? void 0 : _w[0]) {
            musicUrl = detail.music.play_url.url_list[0];
            if (musicUrl && !musicUrl.startsWith('http')) {
                musicUrl = 'https:' + musicUrl;
            }
        }
        var images = isImagePost
            ? detail.images.map(function (img) {
                var _a, _b;
                var url = ((_a = img.url_list) === null || _a === void 0 ? void 0 : _a[0]) || ((_b = img.download_url_list) === null || _b === void 0 ? void 0 : _b[0]) || '';
                return url.startsWith('http') ? url : 'https:' + url;
            })
            : undefined;
        return {
            id: detail.aweme_id || detail.id || '',
            desc: detail.desc || '',
            author: ((_x = detail.author) === null || _x === void 0 ? void 0 : _x.nickname) || '未知',
            authorAvatar: authorAvatar,
            cover: cover,
            videoUrl: videoUrl,
            musicUrl: musicUrl,
            images: images,
            type: isImagePost ? 'images' : 'video',
            stats: {
                likes: ((_y = detail.statistics) === null || _y === void 0 ? void 0 : _y.digg_count) || 0,
                comments: ((_z = detail.statistics) === null || _z === void 0 ? void 0 : _z.comment_count) || 0,
                shares: ((_0 = detail.statistics) === null || _0 === void 0 ? void 0 : _0.share_count) || 0,
            },
            createTime: detail.create_time || 0,
        };
    };
    DouyinParser.prototype.fetchUserProfile = function (url) {
        return __awaiter(this, void 0, void 0, function () {
            var secUid, apiUrl, response, data, user;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        secUid = this.extractSecUid(url);
                        if (!secUid) {
                            throw new Error('无法从链接中提取用户信息');
                        }
                        apiUrl = "https://www.douyin.com/aweme/v1/web/user/profile/?sec_user_id=".concat(secUid, "&aid=6383");
                        return [4 /*yield*/, axios.get(apiUrl, {
                                headers: __assign(__assign({}, headers), { Cookie: this.cookie }),
                                httpsAgent: axiosAgent,
                            })];
                    case 1:
                        response = _c.sent();
                        data = response.data;
                        if (!(data === null || data === void 0 ? void 0 : data.user)) {
                            throw new Error('获取用户信息失败');
                        }
                        user = data.user;
                        return [2 /*return*/, {
                                secUid: secUid,
                                uid: user.uid,
                                nickname: user.nickname,
                                avatar: ((_b = (_a = user.avatar_larger) === null || _a === void 0 ? void 0 : _a.url_list) === null || _b === void 0 ? void 0 : _b[0]) || '',
                                signature: user.signature || '',
                                stats: {
                                    followerCount: user.follower_count || 0,
                                    followingCount: user.following_count || 0,
                                    awemeCount: user.aweme_count || 0,
                                    favoritingCount: user.favoriting_count || 0,
                                },
                            }];
                }
            });
        });
    };
    DouyinParser.prototype.fetchVideoList = function (secUid_1) {
        return __awaiter(this, arguments, void 0, function (secUid, cursor, count) {
            var apiUrl, response, data, list;
            var _this = this;
            if (cursor === void 0) { cursor = 0; }
            if (count === void 0) { count = 20; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        apiUrl = "https://www.douyin.com/aweme/v1/web/aweme/post/?sec_user_id=".concat(secUid, "&count=").concat(count, "&max_cursor=").concat(cursor, "&aid=6383");
                        return [4 /*yield*/, axios.get(apiUrl, {
                                headers: __assign(__assign({}, headers), { Cookie: this.cookie }),
                                httpsAgent: axiosAgent,
                            })];
                    case 1:
                        response = _a.sent();
                        data = response.data;
                        list = (data.aweme_list || []).map(function (item) {
                            return _this.parseVideoDetail(item);
                        });
                        return [2 /*return*/, {
                                list: list,
                                hasMore: data.has_more || false,
                                cursor: data.max_cursor || 0,
                            }];
                }
            });
        });
    };
    DouyinParser.prototype.extractSecUid = function (url) {
        var match = url.match(/sec_uid=([a-zA-Z0-9_-]+)/);
        if (match)
            return match[1];
        var userMatch = url.match(/user\/([a-zA-Z0-9_-]+)/);
        if (userMatch)
            return userMatch[1];
        return null;
    };
    return DouyinParser;
}());
export { DouyinParser };
