import { createServer } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const server = await createServer({
    configFile: false, // Don't use vite.config.ts
    plugins: [react()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "client", "src"),
            "@shared": path.resolve(__dirname, "shared"),
            "@assets": path.resolve(__dirname, "attached_assets"),
        },
    },
    root: path.resolve(__dirname, "client"),
    server: {
        port: 3000,
        host: '127.0.0.1', // Force IPv4
        proxy: {
            '/api': {
                target: 'http://127.0.0.1:5000', // Use IPv4 explicitly
                changeOrigin: true,
                secure: false
            }
        }
    }
});

await server.listen();
server.printUrls();
