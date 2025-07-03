import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import tanstackRouter from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    tailwindcss(),
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Explicitly set the root to prevent looking for files outside this directory
  root: __dirname,
  // Configure server for Docker
  server: {
    host: '0.0.0.0',
    port: 3001,
  },
  // Configure preview server for Docker
  preview: {
    host: '0.0.0.0',
    port: 3001,
  },
});
