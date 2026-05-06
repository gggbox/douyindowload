export interface VideoInfo {
    id: string;
    desc: string;
    author: string;
    authorAvatar: string;
    cover: string;
    videoUrl: string;
    musicUrl?: string;
    images?: string[];
    type: 'video' | 'images';
    stats: {
        likes: number;
        comments: number;
        shares: number;
    };
    createTime: number;
}
export interface UserProfile {
    secUid: string;
    uid: string;
    nickname: string;
    avatar: string;
    signature: string;
    stats: {
        followerCount: number;
        followingCount: number;
        awemeCount: number;
        favoritingCount: number;
    };
}
export declare class DouyinParser {
    private cookie;
    setCookie(cookie: string): void;
    getCookie(): string;
    parse(input: string): Promise<VideoInfo>;
    private extractUrlFromText;
    private extractShareCode;
    private resolveShortUrl;
    private extractVideoId;
    fetchVideoDetail(videoId: string): Promise<VideoInfo>;
    private parseVideoDetail;
    fetchUserProfile(url: string): Promise<UserProfile>;
    fetchVideoList(secUid: string, cursor?: number, count?: number): Promise<{
        list: VideoInfo[];
        hasMore: boolean;
        cursor: number;
    }>;
    private extractSecUid;
}
