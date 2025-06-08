import { defineConfig } from 'vite'

// https://vitejs.dev/config
export default defineConfig({
  build: {
    // @see https://github.com/electron/forge/issues/3439#issuecomment-2705114147
    lib: {
      entry: 'src-electron/main.ts',
      fileName: 'main',
      formats: ['es'],
    },
  },
})
