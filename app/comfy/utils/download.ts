import apiClient from "@/libs/api";

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
    
    // 发送切割请求
    const splitResponse = await apiClient.post('/split-image', formData);
    
    // 检查响应
    if (!splitResponse.data) {
      throw new Error('Invalid response format');
    }

    // 如果有预处理的签名 URL，直接使用它下载
    if (splitResponse.data.signedUrl) {
      const zipResponse = await fetch(splitResponse.data.signedUrl);
      const zipBlob = await zipResponse.blob();
      
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
      return;
    }

    // 如果没有预处理文件，使用返回的 base64 数据（保持原有逻辑作为后备方案）
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
  } catch (error) {
    console.error('Error downloading images:', error);
    throw error;
  }
} 