import axios from 'axios'
import * as https from 'https'

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
})

const headers = {
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

  async parse(url: string): Promise<VideoInfo> {
    const cleanUrl = await this.resolveShortUrl(url)
    const videoId = this.extractVideoId(cleanUrl)

    if (videoId) {
      return await this.fetchVideoDetail(videoId)
    }

    throw new Error('无法解析该链接，请确认链接是否正确')
  }

  private async resolveShortUrl(url: string): Promise<string> {
    try {
      if (url.includes('v.douyin.com') || url.includes('vt.tiktok.com')) {
        const response = await axios.head(url, {
          maxRedirects: 1,
          headers,
          httpsAgent,
          validateStatus: () => true,
        })
        const location = response.headers['location']
        if (location) {
          return location
        }
      }
    } catch {
      // fallback to original url
    }
    return url
  }

  private extractVideoId(url: string): string | null {
    const patterns = [
      /video\/(\d+)/,
      /note\/(\d+)/,
      /modal_id=(\d+)/,
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

    const response = await axios.get(apiUrl, {
      headers: {
        ...headers,
        Cookie: this.cookie,
      },
      httpsAgent,
    })

    const data = response.data
    if (!data?.aweme_detail) {
      throw new Error('获取视频详情失败，可能需要设置Cookie')
    }

    const detail = data.aweme_detail
    const isImagePost = detail.images && detail.images.length > 0

    return {
      id: detail.aweme_id,
      desc: detail.desc,
      author: detail.author?.nickname || '未知',
      authorAvatar: detail.author?.avatar_larger?.url_list?.[0] || '',
      cover: detail.video?.cover?.url_list?.[0] || '',
      videoUrl: detail.video?.play_addr?.url_list?.[0] || '',
      musicUrl: detail.music?.play_url?.url_list?.[0],
      images: isImagePost
        ? detail.images.map((img: any) => img.url_list?.[0] || '')
        : undefined,
      type: isImagePost ? 'images' : 'video',
      stats: {
        likes: detail.statistics?.digg_count || 0,
        comments: detail.statistics?.comment_count || 0,
        shares: detail.statistics?.share_count || 0,
      },
      createTime: detail.create_time,
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
      const isImagePost = item.images && item.images.length > 0
      return {
        id: item.aweme_id,
        desc: item.desc,
        author: item.author?.nickname || '未知',
        authorAvatar: item.author?.avatar_larger?.url_list?.[0] || '',
        cover: item.video?.cover?.url_list?.[0] || '',
        videoUrl: item.video?.play_addr?.url_list?.[0] || '',
        images: isImagePost
          ? item.images.map((img: any) => img.url_list?.[0] || '')
          : undefined,
        type: isImagePost ? 'images' : 'video',
        stats: {
          likes: item.statistics?.digg_count || 0,
          comments: item.statistics?.comment_count || 0,
          shares: item.statistics?.share_count || 0,
        },
        createTime: item.create_time,
      }
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
