import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { isLoggedIn } from '@/utils';

/**
 * 公开路由守卫
 * 已登录用户访问登录/注册页时自动跳转回首页，避免重复登录
 */
function GuestOnly({ children }: { children: ReactNode }) {
  if (isLoggedIn()) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

export default GuestOnly;
