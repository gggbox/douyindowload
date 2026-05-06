import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { resolve } from 'path'
import type { Plugin } from 'vite'
import https from 'https'
import HttpsProxyAgent from 'https-proxy-agent'

function douyinProxyPlugin(): Plugin {
  const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY || process.env.https_proxy || process.env.http_proxy
  const proxyAgent = proxyUrl ? new (HttpsProxyAgent as any)(proxyUrl) : undefined

  return {
    name: 'douyin-proxy',
    configureServer(server) {
      server.middlewares.use('/api/proxy', (req, res, next) => {
        const targetUrl = req.headers['x-target-url'] as string
        const userAgent = (req.headers['x-user-agent'] as string) ||
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

        if (!targetUrl) {
          res.statusCode = 400
          res.end('Missing x-target-url header')
          return
        }

        const parsedUrl = new URL(targetUrl)
        const options: https.RequestOptions = {
          hostname: parsedUrl.hostname,
          port: 443,
          path: parsedUrl.pathname + parsedUrl.search,
          method: req.method,
          headers: {
            'User-Agent': userAgent,
            Referer: 'https://www.douyin.com/',
            Accept: 'application/json, text/html, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            Cookie: req.headers['x-cookie'] as string || '',
          },
          rejectUnauthorized: false,
          agent: proxyAgent,
        }

        const proxyReq = https.request(options, (proxyRes) => {
          const location = proxyRes.headers.location
          if (location && (proxyRes.statusCode === 301 || proxyRes.statusCode === 302 || proxyRes.statusCode === 307 || proxyRes.statusCode === 308)) {
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ redirectUrl: location, statusCode: proxyRes.statusCode }))
            return
          }

          res.setHeader('Access-Control-Allow-Origin', '*')
          res.setHeader('Access-Control-Allow-Headers', '*')
          res.statusCode = proxyRes.statusCode || 200

          const contentType = proxyRes.headers['content-type'] || ''
          res.setHeader('Content-Type', contentType)
          if (location) {
            res.setHeader('X-Redirect-Url', location)
          }

          const chunks: Buffer[] = []
          proxyRes.on('data', (chunk) => chunks.push(chunk))
          proxyRes.on('end', () => {
            const body = Buffer.concat(chunks)
            res.end(body)
          })
        })

        proxyReq.on('error', (err) => {
          console.error('Proxy error:', err.message, (err as any).code)
          res.statusCode = 502
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: err.message, code: (err as any).code }))
        })

        if (req.method === 'POST' || req.method === 'PUT') {
          const chunks: Buffer[] = []
          req.on('data', (chunk) => chunks.push(chunk))
          req.on('end', () => {
            const body = Buffer.concat(chunks)
            if (body.length > 0) {
              proxyReq.write(body)
            }
            proxyReq.end()
          })
        } else {
          proxyReq.end()
        }
      })
    },
  }
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
})
