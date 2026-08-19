import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
  // 预打包 exceljs，避免运行时依赖优化触发整页 reload
  optimizeDeps: {
    include: ['exceljs'],
  },
});
