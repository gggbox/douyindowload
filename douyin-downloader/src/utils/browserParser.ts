import axios from 'axios'

const MOBILE_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
const DESKTOP_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

function extractUrlFromText(text: string): string {
  const douyinShortUrlRegex = /https?:\/\/v\.douyin\.com\/[a-zA-Z0-9]+\/?/
  const shortMatch = text.match(douyinShortUrlRegex)
  if (shortMatch) return shortMatch[0]

  const douyinLongUrlRegex = /https?:\/\/www\.douyin\.com\/[^\s\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]+/
  const longMatch = text.match(douyinLongUrlRegex)
  if (longMatch) return longMatch[0]

  const iesdouyinUrlRegex = /https?:\/\/www\.iesdouyin\.com\/[^\s\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]+/
  const iesMatch = text.match(iesdouyinUrlRegex)
  if (iesMatch) return iesMatch[0]

  const generalUrlRegex = /https?:\/\/[^\s\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]+/
  const generalMatch = text.match(generalUrlRegex)
  if (generalMatch) return generalMatch[0]

  return text.trim()
}

function extractVideoId(url: string): string | null {
  const patterns = [
    /video\/(\d+)/,
    /note\/(\d+)/,
    /share\/video\/(\d+)/,
    /modal_id=(\d+)/,
    /aweme_id=(\d+)/,
    /\/(\d{19})/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }

  return null
}

async function proxyGet(targetUrl: string, userAgent?: string): Promise<{ data: any; headers: Record<string, string> }> {
  const response = await axios.get('/api/proxy', {
    headers: {
      'X-Target-Url': targetUrl,
      'X-User-Agent': userAgent || DESKTOP_UA,
    },
    timeout: 15000,
    validateStatus: () => true,
  })

  if (typeof response.data === 'object' && response.data.redirectUrl) {
    return {
      data: response.data,
      headers: { location: response.data.redirectUrl },
    }
  }

  return {
    data: response.data,
    headers: {
      'content-type': response.headers['content-type'] || '',
      'x-redirect-url': response.headers['x-redirect-url'] || '',
    },
  }
}

async function resolveShortUrl(url: string): Promise<string> {
  if (!url.includes('v.douyin.com') && !url.includes('iesdouyin.com')) {
    return url
  }

  try {
    const { data, headers } = await proxyGet(url)

    const location = headers.location || headers['x-redirect-url']
    if (location) {
      const videoId = extractVideoId(location)
      if (videoId) return location
      return resolveShortUrl(location)
    }

    if (data?.redirectUrl) {
      const videoId = extractVideoId(data.redirectUrl)
      if (videoId) return data.redirectUrl
      return resolveShortUrl(data.redirectUrl)
    }
  } catch {
    // fallback
  }

  return url
}

function parseVideoDetail(detail: any) {
  const isImagePost = detail.images && detail.images.length > 0

  let videoUrl = ''
  if (detail.video) {
    videoUrl =
      detail.video.play_addr?.url_list?.[0] ||
      detail.video.play_addr_265?.url_list?.[0] ||
      detail.video.play_addr_h264?.url_list?.[0] ||
      ''
    if (videoUrl && !videoUrl.startsWith('http')) {
      videoUrl = 'https:' + videoUrl
    }
  }

  let cover = ''
  if (detail.video) {
    cover =
      detail.video.cover?.url_list?.[0] ||
      detail.video.dynamic_cover?.url_list?.[0] ||
      detail.video.origin_cover?.url_list?.[0] ||
      ''
    if (cover && !cover.startsWith('http')) {
      cover = 'https:' + cover
    }
  }

  let authorAvatar = ''
  if (detail.author) {
    authorAvatar =
      detail.author.avatar_larger?.url_list?.[0] ||
      detail.author.avatar_medium?.url_list?.[0] ||
      detail.author.avatar_thumb?.url_list?.[0] ||
      ''
    if (authorAvatar && !authorAvatar.startsWith('http')) {
      authorAvatar = 'https:' + authorAvatar
    }
  }

  let musicUrl: string | undefined
  if (detail.music?.play_url?.url_list?.[0]) {
    musicUrl = detail.music.play_url.url_list[0]
    if (musicUrl && !musicUrl.startsWith('http')) {
      musicUrl = 'https:' + musicUrl
    }
  }

  const images = isImagePost
    ? detail.images.map((img: any) => {
        const imgUrl = img.url_list?.[0] || img.download_url_list?.[0] || ''
        return imgUrl.startsWith('http') ? imgUrl : 'https:' + imgUrl
      })
    : undefined

  return {
    id: detail.aweme_id || detail.id || '',
    desc: detail.desc || '',
    author: detail.author?.nickname || '未知',
    authorAvatar,
    cover,
    videoUrl,
    musicUrl,
    images,
    type: isImagePost ? 'images' : 'video',
    stats: {
      likes: detail.statistics?.digg_count || 0,
      comments: detail.statistics?.comment_count || 0,
      shares: detail.statistics?.share_count || 0,
    },
    createTime: detail.create_time || 0,
  }
}

export async function browserParse(input: string): Promise<any> {
  const extractedUrl = extractUrlFromText(input)

  if (!extractedUrl.startsWith('http')) {
    throw new Error(
      '未检测到有效的链接，请粘贴包含 https://v.douyin.com/xxx/ 链接的分享文本'
    )
  }

  const redirectUrl = await resolveShortUrl(extractedUrl)
  const videoId = extractVideoId(redirectUrl)

  if (!videoId) {
    throw new Error('无法从链接中提取视频ID，请确认链接是否正确')
  }

  try {
    const iesUrl = `https://www.iesdouyin.com/share/video/${videoId}/`
    const { data } = await proxyGet(iesUrl, MOBILE_UA)
    const html = typeof data === 'string' ? data : ''

    const routerDataMatch = html.match(/window\._ROUTER_DATA\s*=\s*(\{.+?\})\s*<\/script>/)
    if (routerDataMatch) {
      try {
        const jsonData = JSON.parse(routerDataMatch[1])
        const videoInfoRes = jsonData?.loaderData?.['video_(id)/page']?.videoInfoRes
        const itemList = videoInfoRes?.item_list
        if (itemList && itemList.length > 0) {
          return { success: true, data: parseVideoDetail(itemList[0]) }
        }
      } catch {
        // parse error, try next
      }
    }
  } catch {
    // try next method
  }

  try {
    const apiUrl = `https://www.douyin.com/aweme/v1/web/aweme/detail/?aweme_id=${videoId}&aid=6383&cookie_enabled=true`
    const { data } = await proxyGet(apiUrl)
    if (data?.aweme_detail) {
      return { success: true, data: parseVideoDetail(data.aweme_detail) }
    }
  } catch {
    // try next method
  }

  try {
    const shareUrl = `https://www.douyin.com/video/${videoId}`
    const { data } = await proxyGet(shareUrl)
    const html = typeof data === 'string' ? data : ''

    const renderDataMatch = html.match(
      /<script\s+id="RENDER_DATA"\s+type="application\/json">([^<]+)<\/script>/
    )
    if (renderDataMatch) {
      const decoded = decodeURIComponent(renderDataMatch[1])
      const jsonData = JSON.parse(decoded)
      const detail =
        jsonData?.[Object.keys(jsonData)[0]]?.awemeDetail ||
        jsonData?.awemeDetail
      if (detail) {
        return { success: true, data: parseVideoDetail(detail) }
      }
    }
  } catch {
    // fallback
  }

  throw new Error(
    '获取视频详情失败。可能原因：\n' +
      '1. 视频已被删除或设为私密\n' +
      '2. 网络连接问题\n' +
      '3. 如持续失败，请在设置页面填入抖音网页版Cookie后重试'
  )
}
