import axios from 'axios'
import * as https from 'https'

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
})

const headers: Record<string, string> = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Referer: 'https://www.douyin.com/',
  Cookie: '',
}

export interface VideoInfo {
  id: string
  desc: string
  author: string
  authorAvatar: string
  cover: string
  videoUrl: string
  musicUrl?: string
  images?: string[]
  type: 'video' | 'images'
  stats: {
    likes: number
    comments: number
    shares: number
  }
  createTime: number
}

export interface UserProfile {
  secUid: string
  uid: string
  nickname: string
  avatar: string
  signature: string
  stats: {
    followerCount: number
    followingCount: number
    awemeCount: number
    favoritingCount: number
  }
}

export class DouyinParser {
  private cookie: string = ''

  setCookie(cookie: string) {
    this.cookie = cookie
    headers.Cookie = cookie
  }

  getCookie(): string {
    return this.cookie
  }

  async parse(input: string): Promise<VideoInfo> {
    const extractedUrl = this.extractUrlFromText(input)

    if (!extractedUrl.startsWith('http')) {
      const shareCode = this.extractShareCode(input)
      if (shareCode) {
        throw new Error(
          '检测到抖音口令分享文本，但未找到链接地址。\n' +
          '请在抖音中使用「复制链接」而非「复制口令」来分享，或在分享文本中包含 https://v.douyin.com/xxx/ 格式的链接。'
        )
      }
      throw new Error('未检测到有效的链接，请粘贴包含 https://v.douyin.com/ 链接的分享文本')
    }

    const redirectUrl = await this.resolveShortUrl(extractedUrl)
    const videoId = this.extractVideoId(redirectUrl)

    if (videoId) {
      return await this.fetchVideoDetail(videoId)
    }

    throw new Error('无法从链接中提取视频ID，请确认链接是否正确')
  }

  private extractUrlFromText(text: string): string {
    const douyinShortUrlRegex = /https?:\/\/v\.douyin\.com\/[a-zA-Z0-9]+\/?/
    const shortMatch = text.match(douyinShortUrlRegex)
    if (shortMatch) return shortMatch[0]

    const douyinLongUrlRegex = /https?:\/\/www\.douyin\.com\/[^\s\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]+/
    const longMatch = text.match(douyinLongUrlRegex)
    if (longMatch) return longMatch[0]

    const iesdouyinUrlRegex = /https?:\/\/www\.iesdouyin\.com\/[^\s\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]+/
    const iesMatch = text.match(iesdouyinUrlRegex)
    if (iesMatch) return iesMatch[0]

    const tiktokUrlRegex = /https?:\/\/(?:vt\.tiktok\.com|www\.tiktok\.com)\/[^\s\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]+/
    const tiktokMatch = text.match(tiktokUrlRegex)
    if (tiktokMatch) return tiktokMatch[0]

    const generalUrlRegex = /https?:\/\/[^\s\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]+/
    const generalMatch = text.match(generalUrlRegex)
    if (generalMatch) return generalMatch[0]

    return text.trim()
  }

  private extractShareCode(text: string): string | null {
    const shareCodeRegex = /[a-zA-Z0-9@._]+\s*[a-zA-Z0-9]+:\/\s/
    const match = text.match(shareCodeRegex)
    if (match) return match[0].trim()

    if (
      text.includes('复制此链接') ||
      text.includes('打开Dou音') ||
      text.includes('打开抖音') ||
      text.includes('直接观看')
    ) {
      return text.substring(0, 50)
    }

    return null
  }

  private async resolveShortUrl(url: string): Promise<string> {
    if (!url.includes('v.douyin.com') && !url.includes('vt.tiktok.com') && !url.includes('iesdouyin.com')) {
      return url
    }

    try {
      const response = await axios.get(url, {
        maxRedirects: 0,
        headers: {
          ...headers,
          Cookie: this.cookie,
        },
        httpsAgent,
        validateStatus: (status) => status >= 200 && status < 400,
      })

      const location = response.headers['location']
      if (location) {
        const videoId = this.extractVideoId(location)
        if (videoId) return location
        return this.resolveShortUrl(location)
      }
    } catch (error: any) {
      if (error.response?.headers?.location) {
        const location = error.response.headers.location
        const videoId = this.extractVideoId(location)
        if (videoId) return location
        return this.resolveShortUrl(location)
      }
    }

    try {
      const response = await axios.head(url, {
        maxRedirects: 0,
        headers: {
          ...headers,
          Cookie: this.cookie,
        },
        httpsAgent,
        validateStatus: (status) => status >= 200 && status < 400,
      })

      const location = response.headers['location']
      if (location) {
        const videoId = this.extractVideoId(location)
        if (videoId) return location
        return this.resolveShortUrl(location)
      }
    } catch (error: any) {
      if (error.response?.headers?.location) {
        const location = error.response.headers.location
        const videoId = this.extractVideoId(location)
        if (videoId) return location
        return this.resolveShortUrl(location)
      }
    }

    try {
      const response = await axios.get(url, {
        maxRedirects: 5,
        headers: {
          ...headers,
          Cookie: this.cookie,
        },
        httpsAgent,
        validateStatus: () => true,
      })

      const finalUrl = response.request?.res?.responseUrl
      if (finalUrl && finalUrl !== url) {
        return finalUrl
      }
    } catch {
      // fallback
    }

    return url
  }

  private extractVideoId(url: string): string | null {
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

  async fetchVideoDetail(videoId: string): Promise<VideoInfo> {
    const apiUrl = `https://www.douyin.com/aweme/v1/web/aweme/detail/?aweme_id=${videoId}&aid=6383&cookie_enabled=true`

    try {
      const response = await axios.get(apiUrl, {
        headers: {
          ...headers,
          Cookie: this.cookie,
        },
        httpsAgent,
        timeout: 10000,
      })

      const data = response.data
      if (data?.aweme_detail) {
        return this.parseVideoDetail(data.aweme_detail)
      }
    } catch {
      // try next method
    }

    try {
      const shareUrl = `https://www.douyin.com/video/${videoId}`
      const response = await axios.get(shareUrl, {
        headers: {
          ...headers,
          Cookie: this.cookie,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        httpsAgent,
        timeout: 10000,
      })

      const html = typeof response.data === 'string' ? response.data : ''
      const renderDataMatch = html.match(/<script\s+id="RENDER_DATA"\s+type="application\/json">([^<]+)<\/script>/)
      if (renderDataMatch) {
        const decoded = decodeURIComponent(renderDataMatch[1])
        const jsonData = JSON.parse(decoded)
        const detail = jsonData?.[Object.keys(jsonData)[0]]?.awemeDetail || jsonData?.awemeDetail
        if (detail) {
          return this.parseVideoDetail(detail)
        }
      }

      const routerDataMatch = html.match(/window\._ROUTER_DATA\s*=\s*(\{.+?\})\s*<\/script>/)
      if (routerDataMatch) {
        const jsonData = JSON.parse(routerDataMatch[1])
        const detail = jsonData?.loaderData?.videoDetail?.awemeDetail
        if (detail) {
          return this.parseVideoDetail(detail)
        }
      }
    } catch {
      // try next method
    }

    try {
      const iesUrl = `https://www.iesdouyin.com/share/video/${videoId}/`
      const response = await axios.get(iesUrl, {
        headers: {
          ...headers,
          Cookie: this.cookie,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        httpsAgent,
        timeout: 10000,
      })

      const html = typeof response.data === 'string' ? response.data : ''
      const renderDataMatch = html.match(/<script\s+id="RENDER_DATA"\s+type="application\/json">([^<]+)<\/script>/)
      if (renderDataMatch) {
        const decoded = decodeURIComponent(renderDataMatch[1])
        const jsonData = JSON.parse(decoded)
        const detail = jsonData?.[Object.keys(jsonData)[0]]?.awemeDetail || jsonData?.awemeDetail
        if (detail) {
          return this.parseVideoDetail(detail)
        }
      }
    } catch {
      // fallback
    }

    throw new Error(
      '获取视频详情失败。可能原因：\n' +
      '1. 未设置Cookie - 请在设置页面填入抖音网页版Cookie\n' +
      '2. 视频已被删除或设为私密\n' +
      '3. 网络连接问题'
    )
  }

  private parseVideoDetail(detail: any): VideoInfo {
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
          const url = img.url_list?.[0] || img.download_url_list?.[0] || ''
          return url.startsWith('http') ? url : 'https:' + url
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

  async fetchUserProfile(url: string): Promise<UserProfile> {
    const secUid = this.extractSecUid(url)
    if (!secUid) {
      throw new Error('无法从链接中提取用户信息')
    }

    const apiUrl = `https://www.douyin.com/aweme/v1/web/user/profile/?sec_user_id=${secUid}&aid=6383`

    const response = await axios.get(apiUrl, {
      headers: {
        ...headers,
        Cookie: this.cookie,
      },
      httpsAgent,
    })

    const data = response.data
    if (!data?.user) {
      throw new Error('获取用户信息失败')
    }

    const user = data.user
    return {
      secUid,
      uid: user.uid,
      nickname: user.nickname,
      avatar: user.avatar_larger?.url_list?.[0] || '',
      signature: user.signature || '',
      stats: {
        followerCount: user.follower_count || 0,
        followingCount: user.following_count || 0,
        awemeCount: user.aweme_count || 0,
        favoritingCount: user.favoriting_count || 0,
      },
    }
  }

  async fetchVideoList(secUid: string, cursor: number = 0, count: number = 20): Promise<{
    list: VideoInfo[]
    hasMore: boolean
    cursor: number
  }> {
    const apiUrl = `https://www.douyin.com/aweme/v1/web/aweme/post/?sec_user_id=${secUid}&count=${count}&max_cursor=${cursor}&aid=6383`

    const response = await axios.get(apiUrl, {
      headers: {
        ...headers,
        Cookie: this.cookie,
      },
      httpsAgent,
    })

    const data = response.data
    const list: VideoInfo[] = (data.aweme_list || []).map((item: any) => {
      return this.parseVideoDetail(item)
    })

    return {
      list,
      hasMore: data.has_more || false,
      cursor: data.max_cursor || 0,
    }
  }

  private extractSecUid(url: string): string | null {
    const match = url.match(/sec_uid=([a-zA-Z0-9_-]+)/)
    if (match) return match[1]

    const userMatch = url.match(/user\/([a-zA-Z0-9_-]+)/)
    if (userMatch) return userMatch[1]

    return null
  }
}
