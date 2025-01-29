import apiClient from "@/libs/api";
import toast from "react-hot-toast";

interface DownloadImageOptions {
  imageUrl: string;
  type?: string;
  fileName?: string;
}

export async function downloadGeneratedImage({
  imageUrl,
  type = 'basic',
  fileName = 'shime.zip'
}: DownloadImageOptions): Promise<void> {
  try {
    // 获取预签名 URL
    const { data: { signedUrl } } = await apiClient.post('/get-signed-url', {
      imageUrl
    });

    if (!signedUrl) {
      throw new Error('Failed to get signed URL');
    }

    // 使用预签名 URL 获取图片数据
    const response = await fetch(signedUrl);
    const imageBlob = await response.blob();

    // 创建 FormData
    const formData = new FormData();
    formData.append('image', imageBlob, 'image.png');
    formData.append('type', type);

    // 发送切割请求并下载 zip
    const splitResponse = await apiClient.post('/split-image', formData);
    if (!splitResponse.data?.zipBase64) {
      throw new Error('Invalid response format');
    }

    // 将 base64 转换为 Blob
    const binaryString = atob(splitResponse.data.zipBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const zipBlob = new Blob([bytes], { type: 'application/zip' });
    
    // 创建下载链接
    const url = window.URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    
    // 触发下载
    document.body.appendChild(link);
    link.click();
    
    // 清理
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    toast.success('Images downloaded successfully');
  } catch (error) {
    console.error('Error downloading images:', error);
    toast.error('Failed to download images');
    throw error;
  }
} 