import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import ProductsPage from './pages/products';
import ShipmentsPage from './pages/shipments';
import LoginPage from './pages/login';
import RegisterPage from './pages/register';
import RequireAuth from './components/RequireAuth';
import GuestOnly from './components/GuestOnly';

function App() {
  return (
    <Routes>
      {/* 公开路由：登录 / 注册（已登录用户访问会自动跳转回首页） */}
      <Route
        path="/login"
        element={
          <GuestOnly>
            <LoginPage />
          </GuestOnly>
        }
      />
      <Route
        path="/register"
        element={
          <GuestOnly>
            <RegisterPage />
          </GuestOnly>
        }
      />

      {/* 受保护路由：未登录访问会自动跳转登录页 */}
      <Route
        path="/"
        element={
          <RequireAuth>
            <MainLayout />
          </RequireAuth>
        }
      >
        {/* 所有业务页面共享 MainLayout 布局 */}
        {/* 默认重定向到品类管理 */}
        <Route index element={<Navigate to="/products" replace />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="shipments" element={<ShipmentsPage />} />
        {/* 兜底：未匹配路由重定向到品类管理 */}
        <Route path="*" element={<Navigate to="/products" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
