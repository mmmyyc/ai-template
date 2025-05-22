// HTML内容本地存储帮助函数

const BASE_HTML_STORAGE_KEY = 'savedHtmlContent';

// 从URL或路径获取页面键前缀
const getPathPrefix = (pagePath?: string): string => {
  // 如果提供了明确的路径，使用它
  if (pagePath) {
    // 提取关键路径段
    if (pagePath.includes('/streamppt/')) {
      return 'streamppt';
    } else if (pagePath.includes('/generation/')) {
      // 从路径中提取文件名
      const match = pagePath.match(/\/generation\/([^/]+)/);
      if (match && match[1]) {
        return `generation_${match[1]}`;
      }
      return 'generation';
    }
  }
  
  // 如果没有提供路径或在服务器端，尝试从当前URL获取
  if (typeof window !== 'undefined') {
    const url = window.location.pathname;
    if (url.includes('/streamppt/')) {
      return 'streamppt';
    } else if (url.includes('/generation/')) {
      // 从URL中提取文件名
      const match = url.match(/\/generation\/([^/]+)/);
      if (match && match[1]) {
        return `generation_${match[1]}`;
      }
      return 'generation';
    }
  }
  
  // 默认值
  return 'default';
};

// 获取带路径前缀的存储键
const getStorageKey = (pagePath?: string, folderId?: string): string => {
  const prefix = getPathPrefix(pagePath);
  return `${BASE_HTML_STORAGE_KEY}_${prefix}_${folderId}`;
};

// 保存HTML内容到localStorage
export const saveHtmlToLocalStorage = (html: string, pagePath?: string, folderId?: string): void => {
  try {
    const key = getStorageKey(pagePath, folderId);
    localStorage.setItem(key, html);
    console.log(`HTML内容已保存到本地存储 (${key})`);
  } catch (error) {
    console.error('保存HTML到本地存储时出错:', error);
  }
};

// 从localStorage加载HTML内容
export const loadHtmlFromLocalStorage = (pagePath?: string, folderId?: string): string | null => {
  try {
    const key = getStorageKey(pagePath, folderId);
    const savedHtml = localStorage.getItem(key);
    if (savedHtml) {
      console.log(`已从本地存储加载HTML内容 (${key})`);
      return savedHtml;
    }
  } catch (error) {
    console.error('从本地存储加载HTML时出错:', error);
  }
  return null;
};

// 检查localStorage中是否有保存的HTML内容
export const hasSavedHtml = (pagePath?: string): boolean => {
  try {
    const key = getStorageKey(pagePath);
    return !!localStorage.getItem(key);
  } catch (error) {
    return false;
  }
};

// 清除保存的HTML内容
export const clearSavedHtml = (pagePath?: string): void => {
  try {
    const key = getStorageKey(pagePath);
    localStorage.removeItem(key);
    console.log(`已清除保存的HTML内容 (${key})`);
  } catch (error) {
    console.error('清除保存的HTML内容时出错:', error);
  }
}; 