import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: [
            { find: '@components', replacement: path.resolve(__dirname, 'src/components') },
            { find: '@views', replacement: path.resolve(__dirname, 'src/views') },
            { find: '@services', replacement: path.resolve(__dirname, 'src/services') },
            { find: '@contexts', replacement: path.resolve(__dirname, 'src/contexts') },
        ],
    },
    server: {
        port: 3103,
        strictPort: true,
        host: '0.0.0.0',
        hmr: {
            overlay: true,
        },
        watch: {
            usePolling: false,
            ignored: ['**/node_modules/**', '**/.git/**'],
        },
        proxy: {
            '/api/portal': {
                target: 'http://localhost:3000',
                changeOrigin: true,
                secure: false,
            },
            '/api': {
                target: 'http://localhost:3003',
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path.replace(/^\/api/, ''),
            },
        },
    },
    build: {
        outDir: 'dist',
        sourcemap: true,
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom', 'react-router-dom'],
                },
            },
        },
    },
    optimizeDeps: {
        include: ['react', 'react-dom', 'react-router-dom', 'axios'],
    },
});
