type DownloadEventCallback = (data: any) => void;
export declare class DownloadManager {
    private downloads;
    private listeners;
    startDownload(url: string, filename: string, savePath: string): Promise<string>;
    startBatchDownload(items: Array<{
        url: string;
        filename: string;
    }>, savePath: string): Promise<string[]>;
    private startDownloadProcess;
    cancelDownload(id: string): void;
    on(event: string, callback: DownloadEventCallback): void;
    private emit;
}
export {};
