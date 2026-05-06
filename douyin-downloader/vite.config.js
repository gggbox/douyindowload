import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import { resolve } from 'path';
import https from 'https';
import HttpsProxyAgent from 'https-proxy-agent';
function douyinProxyPlugin() {
    var proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY || process.env.https_proxy || process.env.http_proxy;
    var proxyAgent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined;
    return {
        name: 'douyin-proxy',
        configureServer: function (server) {
            server.middlewares.use('/api/proxy', function (req, res, next) {
                var targetUrl = req.headers['x-target-url'];
                var userAgent = req.headers['x-user-agent'] ||
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
                if (!targetUrl) {
                    res.statusCode = 400;
                    res.end('Missing x-target-url header');
                    return;
                }
                var parsedUrl = new URL(targetUrl);
                var options = {
                    hostname: parsedUrl.hostname,
                    port: 443,
                    path: parsedUrl.pathname + parsedUrl.search,
                    method: req.method,
                    headers: {
                        'User-Agent': userAgent,
                        Referer: 'https://www.douyin.com/',
                        Accept: 'application/json, text/html, */*',
                        'Accept-Language': 'zh-CN,zh;q=0.9',
                        Cookie: req.headers['x-cookie'] || '',
                    },
                    rejectUnauthorized: false,
                    agent: proxyAgent,
                };
                var proxyReq = https.request(options, function (proxyRes) {
                    var location = proxyRes.headers.location;
                    if (location && (proxyRes.statusCode === 301 || proxyRes.statusCode === 302 || proxyRes.statusCode === 307 || proxyRes.statusCode === 308)) {
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify({ redirectUrl: location, statusCode: proxyRes.statusCode }));
                        return;
                    }
                    res.setHeader('Access-Control-Allow-Origin', '*');
                    res.setHeader('Access-Control-Allow-Headers', '*');
                    res.statusCode = proxyRes.statusCode || 200;
                    var contentType = proxyRes.headers['content-type'] || '';
                    res.setHeader('Content-Type', contentType);
                    if (location) {
                        res.setHeader('X-Redirect-Url', location);
                    }
                    var chunks = [];
                    proxyRes.on('data', function (chunk) { return chunks.push(chunk); });
                    proxyRes.on('end', function () {
                        var body = Buffer.concat(chunks);
                        res.end(body);
                    });
                });
                proxyReq.on('error', function (err) {
                    console.error('Proxy error:', err.message, err.code);
                    res.statusCode = 502;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: err.message, code: err.code }));
                });
                if (req.method === 'POST' || req.method === 'PUT') {
                    var chunks_1 = [];
                    req.on('data', function (chunk) { return chunks_1.push(chunk); });
                    req.on('end', function () {
                        var body = Buffer.concat(chunks_1);
                        if (body.length > 0) {
                            proxyReq.write(body);
                        }
                        proxyReq.end();
                    });
                }
                else {
                    proxyReq.end();
                }
            });
        },
    };
}
export default defineConfig({
    plugins: [
        vue(),
        douyinProxyPlugin(),
        AutoImport({
            resolvers: [ElementPlusResolver()],
            imports: ['vue', 'vue-router', 'pinia'],
            dts: 'src/auto-imports.d.ts',
        }),
        Components({
            resolvers: [ElementPlusResolver()],
            dts: 'src/components.d.ts',
        }),
    ],
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
        },
    },
    base: './',
    server: {
        port: 5173,
    },
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        rollupOptions: {
            output: {
                manualChunks: {
                    'element-plus': ['element-plus'],
                    'vue-vendor': ['vue', 'vue-router', 'pinia'],
                },
            },
        },
    },
});
