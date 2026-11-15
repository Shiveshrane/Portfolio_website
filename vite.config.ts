import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import arxivPapers from './plugins/arxiv';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        arxivPapers({
          author: env.VITE_ARXIV_AUTHOR || env.VITE_NAME || 'Shivesh Rane',
          ids: env.VITE_ARXIV_IDS ? env.VITE_ARXIV_IDS.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
          snapshotPath: path.resolve(__dirname, 'data/arxiv-papers.json'),
        }),
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
