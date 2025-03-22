import { type NextRequest } from "next/server";
import { updateSession } from "@/libs/supabase/middleware";
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

// 创建国际化中间件
const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 检查是否为API路由
  if (pathname.startsWith('/api')) {
    // 只应用会话更新，不应用国际化
    return await updateSession(request);
  }
  
  // 对于普通页面路由，应用完整的中间件链
  // 首先处理国际化路由
  const response = await intlMiddleware(request);
  
  // 然后更新 session
  const sessionResponse = await updateSession(request);
  
  // 合并响应头
  response.headers.forEach((value, key) => {
    sessionResponse.headers.set(key, value);
  });
  
  return sessionResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    // 匹配API路由（只应用会话更新）
    "/api/:path*"
  ],
};
