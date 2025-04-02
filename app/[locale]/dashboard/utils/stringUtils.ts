/**
 * 扩展String原型，添加hashCode方法
 * 这个函数会在客户端代码中执行
 */
export function extendStringPrototype() {
  if (typeof window !== 'undefined' && !String.prototype.hashCode) {
    // 添加一个稳定的散列函数，确保相同字符串生成相同的散列值
    String.prototype.hashCode = function() {
      let hash = 0;
      for (let i = 0; i < this.length; i++) {
        const char = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      // 使用正数以避免"-"字符导致CSS选择器问题
      return Math.abs(hash).toString(36);
    };
  }
}

/**
 * 计算字符串的哈希值
 * 这个函数可以在服务器端和客户端代码中使用
 */
export function getStringHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  // 使用正数以避免"-"字符导致CSS选择器问题
  return Math.abs(hash).toString(36);
}

/**
 * 为DOM元素生成可预测的ID
 * 基于元素类型、类名和内容
 */
export function generateElementId(
  elementName: string,
  className?: string,
  content?: string,
  index?: number
): string {
  const basePath = elementName + 
                  (className ? `.${className.replace(/\s+/g, '.')}` : '') +
                  (content ? `-${content.substring(0, 10)}` : '') +
                  (index !== undefined ? `-${index}` : '');
  
  return `el-${getStringHash(basePath)}`;
} 