import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import ProductsPage from './pages/products';
import ShipmentsPage from './pages/shipments';

function App() {
  return (
    <Routes>
      {/* 所有业务页面共享 MainLayout 布局 */}
      <Route path="/" element={<MainLayout />}>
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
