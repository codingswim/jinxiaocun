import { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isLoggedIn } from '@/utils';

/**
 * 受保护路由守卫
 * 未登录访问时跳转到登录页，并通过 location.state 记录来源路径，
 * 便于登录成功后回跳到原本想访问的页面
 */
function RequireAuth({ children }: { children: ReactNode }) {
  const location = useLocation();
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <>{children}</>;
}

export default RequireAuth;
