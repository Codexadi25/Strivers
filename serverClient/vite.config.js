import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  resolve: {
    dedupe: ['react', 'react-dom', '@emotion/react', '@emotion/styled'],
    alias: {
      'react': path.resolve(import.meta.dirname, '../client/node_modules/react'),
      'react-dom': path.resolve(import.meta.dirname, '../client/node_modules/react-dom'),
      'react/jsx-runtime': path.resolve(import.meta.dirname, '../client/node_modules/react/jsx-runtime'),
      'react/jsx-dev-runtime': path.resolve(import.meta.dirname, '../client/node_modules/react/jsx-dev-runtime'),
      '@mui/material': path.resolve(import.meta.dirname, '../client/node_modules/@mui/material'),
      '@mui/icons-material': path.resolve(import.meta.dirname, '../client/node_modules/@mui/icons-material'),
      '@emotion/react': path.resolve(import.meta.dirname, '../client/node_modules/@emotion/react'),
      '@emotion/styled': path.resolve(import.meta.dirname, '../client/node_modules/@emotion/styled'),
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@mui/material',
      '@mui/icons-material',
      '@emotion/react',
      '@emotion/styled',
    ],
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: false,
    cors: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
