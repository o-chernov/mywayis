import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Путь от корня проекта — не требует node-типов в конфиге.
    alias: { '@': '/src' },
  },
  build: {
    rollupOptions: {
      output: {
        // Recharts тянет d3 и весит больше всего остального кода вместе взятого.
        // Отдельным чанком он кешируется независимо от нашего приложения.
        manualChunks: {
          charts: ['recharts'],
          vendor: ['react', 'react-dom', 'react-router'],
          i18n: ['i18next', 'react-i18next', 'i18next-browser-languagedetector'],
        },
      },
    },
  },
  server: {
    // Явный IPv4: по умолчанию Vite слушает только ::1, и часть клиентов,
    // резолвящих localhost в 127.0.0.1, до него не достучится.
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
  },
});
