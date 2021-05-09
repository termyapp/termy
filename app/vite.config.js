import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import reactRefresh from '@vitejs/plugin-react-refresh'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [reactRefresh(), tsconfigPaths()],
  base: './',
  server: {
    port: 4242,
  },
  build: {
    outDir: '../electron/build',
    emptyOutDir: true,
  },
})
