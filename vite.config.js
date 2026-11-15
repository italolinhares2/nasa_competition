import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

/**
 * Dois modos de build:
 *  - padrão (`npm run build`): site estático em dist/ (GitHub Pages, Vercel...).
 *  - single (`npm run build:single`): um único index.html em dist-single/,
 *    com JS, CSS e imagem embutidos — para abrir com dois cliques ou colar
 *    em ferramentas que aceitam só um arquivo HTML.
 */
export default defineConfig(({ mode }) => {
  const single = mode === 'single';
  return {
    base: './',
    plugins: single ? [viteSingleFile()] : [],
    build: single ? { outDir: 'dist-single', assetsInlineLimit: Number.MAX_SAFE_INTEGER } : {},
    test: { environment: 'node', include: ['tests/**/*.test.js'] },
  };
});
