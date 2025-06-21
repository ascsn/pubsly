import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      define: {
        'process.env.AUTH0_DOMAIN': JSON.stringify(env.AUTH0_DOMAIN),
        'process.env.AUTH0_CLIENT_ID': JSON.stringify(env.AUTH0_CLIENT_ID),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
