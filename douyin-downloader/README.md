# 抖音下载器 (Douyin Downloader)

一款基于 Electron + Vue 3 + Element Plus 构建的抖音视频/图集下载桌面工具，支持链接解析、用户主页批量下载、内嵌浏览器浏览及下载管理等功能。

## 功能特性

- **链接解析** — 粘贴抖音分享链接或分享文本，一键解析视频/图集内容，支持视频下载和音频提取
- **主页批量** — 输入用户主页链接，获取用户发布的全部视频/图集，支持全选、反选和批量下载
- **内嵌浏览** — 内嵌浏览器直接访问抖音网页版，浏览时一键解析当前页面视频
- **下载管理** — 实时显示下载进度，支持取消下载、状态筛选和打开文件所在目录
- **Cookie 管理** — 支持配置抖音 Cookie，解锁更多内容解析能力
- **深色主题** — 精心设计的深色 UI，符合抖音品牌风格
- **多平台支持** — 支持 Windows、macOS 和 Linux

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Electron 28 + Vue 3.4 |
| UI | Element Plus 2.4 + @element-plus/icons-vue |
| 状态管理 | Pinia 2.1 |
| 路由 | Vue Router 4.2 (Hash 模式) |
| 构建 | Vite 5 + TypeScript 5.3 |
| HTTP | Axios 1.6 |
| 样式 | SCSS + CSS Variables 深色主题 |
| 打包 | electron-builder 24 |

## 项目结构

```
douyin-downloader/
├── electron/                  # Electron 主进程
│   ├── main.ts                # 主进程入口，窗口创建与 IPC 注册
│   ├── preload.ts             # 预加载脚本，桥接主进程与渲染进程
│   ├── parser.ts              # 抖音解析器，链接解析与视频详情获取
│   └── downloader.ts          # 下载管理器，支持单文件/批量下载
├── src/                       # 前端渲染进程
│   ├── pages/                 # 页面组件
│   │   ├── ParsePage.vue      # 链接解析页
│   │   ├── ProfilePage.vue    # 用户主页批量下载页
│   │   ├── BrowserPage.vue    # 内嵌浏览器页
│   │   ├── DownloadPage.vue   # 下载管理页
│   │   └── SettingsPage.vue   # 设置页
│   ├── router/                # 路由配置
│   ├── stores/                # Pinia 状态管理
│   ├── styles/                # 全局样式
│   ├── utils/                 # 工具函数
│   │   └── browserParser.ts   # 浏览器端解析器（非 Electron 环境回退方案）
│   ├── App.vue                # 根组件
│   └── main.ts                # 前端入口
├── index.html                 # HTML 入口
├── vite.config.ts             # Vite 配置（含代理中间件）
├── electron-builder.json      # Electron 打包配置
├── tsconfig.json              # TypeScript 配置
└── package.json               # 项目配置
```

## 快速开始

### 环境要求

- Node.js >= 18
- npm >= 9

### 安装依赖

```bash
npm install
```

> 国内用户如遇 Electron 下载缓慢，项目已配置 `.npmrc` 使用 npmmirror 镜像源。

### 开发模式

```bash
# 仅前端开发（浏览器预览）
npm run dev

# Electron 开发模式
npm run electron:dev
```

### 构建打包

```bash
# 前端构建
npm run build

# Electron 完整打包（生成安装包）
npm run electron:build
```

## 使用说明

### 链接解析

1. 在抖音 APP 中找到目标视频，点击「分享」→「复制链接」
2. 将分享文本粘贴到解析页输入框
3. 点击「解析」按钮，等待解析完成
4. 点击「下载」保存视频/图集

> **注意：** 请使用「复制链接」而非「复制口令」分享，口令格式不包含有效链接地址。

### 用户主页批量下载

1. 获取用户主页链接（抖音网页版打开用户主页，复制 URL）
2. 粘贴到主页批量页输入框
3. 获取用户信息和视频列表后，勾选需要下载的内容
4. 点击「批量下载」

### Cookie 配置

部分内容需要登录态才能解析，配置步骤：

1. 在浏览器中打开 douyin.com 并登录
2. 按 F12 打开开发者工具
3. 切换到「网络」(Network) 标签，刷新页面
4. 在任意请求的请求头中找到 Cookie 字段并复制
5. 粘贴到设置页的 Cookie 输入框并保存

## 解析原理

解析器采用多策略回退机制，确保最大兼容性：

1. **短链接解析** — `v.douyin.com` 短链接通过 302 重定向获取真实地址
2. **iesdouyin 移动端** — 使用移动端 User-Agent 访问 `iesdouyin.com/share/video/{id}/`，从 HTML 中提取 `window._ROUTER_DATA` 数据（无需 Cookie）
3. **抖音 API** — 调用 `aweme/v1/web/aweme/detail` 接口获取视频详情
4. **抖音网页** — 解析 `www.douyin.com/video/{id}` 页面中的 `RENDER_DATA`

## 许可证

MIT
