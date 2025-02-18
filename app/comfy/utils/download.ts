import apiClient from "@/libs/api";
import toast from "react-hot-toast";

interface DownloadImageOptions {
  imageUrl: string;
  type?: string;
  fileName?: string;
}

interface FileSystemHandle {
  readonly kind: 'file' | 'directory';
  readonly name: string;
}

interface FileSystemFileHandle extends FileSystemHandle {
  readonly kind: 'file';
  getFile(): Promise<File>;
  createWritable(): Promise<FileSystemWritableFileStream>;
}

interface FileSystemWritableFileStream extends WritableStream {
  write(data: any): Promise<void>;
  seek(position: number): Promise<void>;
  truncate(size: number): Promise<void>;
}

// 用于跟踪下载状态的 Map
const downloadStateMap = new Map<string, boolean>();

// 节流函数
function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let inThrottle: boolean = false;
  return async function(...args: Parameters<T>): Promise<ReturnType<T>> {
    if (!inThrottle) {
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
      return func.apply(this, args);
    }
    throw new Error('Please wait before starting another download');
  };
}

export const downloadGeneratedImage = throttle(async function({
  imageUrl,
  type = 'basic',
  fileName = 'shime.zip'
}: DownloadImageOptions): Promise<void> {
  // 检查是否已经在下载中
  if (downloadStateMap.get(imageUrl)) {
    toast.error('A download is already in progress. Please wait.', {
      duration: 3000,
      id: 'download-duplicate'
    });
    return;
  }

  // 设置下载状态
  downloadStateMap.set(imageUrl, true);
  const loadingToastId = toast.loading('Preparing your download...', {
    id: 'download-progress',
    duration: Infinity // 保持 toast 显示直到我们手动关闭
  });

  try {
    // // 获取预签名 URL
    toast.loading('Getting image data... (Step 1/3)', { id: loadingToastId });
    // const { data: { signedUrl } } = await apiClient.post('/get-signed-url', {
    //   imageUrl
    // });

    // if (!signedUrl) {
    //   throw new Error('Failed to get signed URL');
    // }
    
    // // 使用预签名 URL 获取图片数据
    // const response = await fetch(signedUrl);
    const response = await fetch(imageUrl);
    const imageBlob = await response.blob();
    
    // 创建 FormData
    const formData = new FormData();
    formData.append('image', imageBlob, 'image.png');
    formData.append('type', type);
    
    // 发送切割请求
    toast.loading('Processing images... (Step 2/3)', { id: loadingToastId });
    const splitResponse = await apiClient.post('/split-image', formData);
    
    if (!splitResponse.data) {
      throw new Error('Invalid response format');
    }

    toast.loading('Starting download... (Step 3/3)', { id: loadingToastId });

    // 如果没有预处理文件，使用返回的 base64 数据
    if (!splitResponse.data.zipBase64) {
      throw new Error('No zip data available');
    }

    // 将 base64 转换为 Blob
    const binaryString = atob(splitResponse.data.zipBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const zipBlob = new Blob([bytes], { type: 'application/zip' });
    
    await startDownload(zipBlob, fileName);

    toast.success('Download started! Please wait for your browser to complete the download.', {
      id: loadingToastId,
      duration: 5000
    });

  } catch (error) {
    console.error('Error downloading images:', error);
    toast.error(error instanceof Error ? error.message : 'Download failed. Please try again.', {
      id: loadingToastId,
      duration: 3000
    });
    throw error;
  } finally {
    // 清理下载状态
    downloadStateMap.set(imageUrl, false);
  }
}, 5000); // 5秒内不能重复触发

// 辅助函数：处理文件下载
async function startDownload(blob: Blob, fileName: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      // 创建一个新的 Blob 对象，添加类型信息
      const file = new Blob([blob], { type: 'application/zip' });
      
      // 使用 showSaveFilePicker API 来触发"另存为"对话框
      if ('showSaveFilePicker' in window) {
        window.showSaveFilePicker({
          suggestedName: fileName,
          types: [{
            description: 'Zip files',
            accept: {
              'application/zip': ['.zip'],
            },
          }],
        }).then(async (handle: FileSystemFileHandle) => {
          const writable = await handle.createWritable();
          await writable.write(file);
          await writable.close();
          resolve();
        }).catch((error: Error) => {
          // 如果用户取消了保存对话框或浏览器不支持，回退到传统方法
          const url = window.URL.createObjectURL(file);
          const link = document.createElement('a');
          link.href = url;
          link.download = fileName;
          link.click();
          window.URL.revokeObjectURL(url);
          resolve();
        });
      } else {
        // 对于不支持 showSaveFilePicker 的浏览器，使用传统方法
        const url = window.URL.createObjectURL(file);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        window.URL.revokeObjectURL(url);
        resolve();
      }
    } catch (error) {
      reject(error);
    }
  });
} 