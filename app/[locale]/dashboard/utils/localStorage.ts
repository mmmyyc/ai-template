// HTML内容本地存储帮助函数

const HTML_STORAGE_KEY = 'savedHtmlContent';

// 保存HTML内容到localStorage
export const saveHtmlToLocalStorage = (html: string): void => {
  try {
    localStorage.setItem(HTML_STORAGE_KEY, html);
    console.log('HTML内容已保存到本地存储');
  } catch (error) {
    console.error('保存HTML到本地存储时出错:', error);
  }
};

// 从localStorage加载HTML内容
export const loadHtmlFromLocalStorage = (): string | null => {
  try {
    const savedHtml = localStorage.getItem(HTML_STORAGE_KEY);
    if (savedHtml) {
      console.log('已从本地存储加载HTML内容');
      return savedHtml;
    }
  } catch (error) {
    console.error('从本地存储加载HTML时出错:', error);
  }
  return null;
};

// 检查localStorage中是否有保存的HTML内容
export const hasSavedHtml = (): boolean => {
  try {
    return !!localStorage.getItem(HTML_STORAGE_KEY);
  } catch (error) {
    return false;
  }
};

// 清除保存的HTML内容
export const clearSavedHtml = (): void => {
  try {
    localStorage.removeItem(HTML_STORAGE_KEY);
    console.log('已清除保存的HTML内容');
  } catch (error) {
    console.error('清除保存的HTML内容时出错:', error);
  }
}; 