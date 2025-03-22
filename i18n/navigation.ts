import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

// 为Next.js的导航API创建轻量级包装
export const {
  Link,
  redirect, 
  usePathname,
  useRouter,
  getPathname
} = createNavigation(routing); 