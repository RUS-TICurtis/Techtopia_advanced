import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5185,
  },
  resolve: {
    alias: {
      'es-toolkit/compat/get': path.resolve('src/lib/es-toolkit-compat/get.js'),
      'es-toolkit/compat/isPlainObject': path.resolve('src/lib/es-toolkit-compat/isPlainObject.js'),
      'es-toolkit/compat/last': path.resolve('src/lib/es-toolkit-compat/last.js'),
      'es-toolkit/compat/maxBy': path.resolve('src/lib/es-toolkit-compat/maxBy.js'),
      'es-toolkit/compat/minBy': path.resolve('src/lib/es-toolkit-compat/minBy.js'),
      'es-toolkit/compat/omit': path.resolve('src/lib/es-toolkit-compat/omit.js'),
      'es-toolkit/compat/range': path.resolve('src/lib/es-toolkit-compat/range.js'),
      'es-toolkit/compat/sortBy': path.resolve('src/lib/es-toolkit-compat/sortBy.js'),
      'es-toolkit/compat/sumBy': path.resolve('src/lib/es-toolkit-compat/sumBy.js'),
      'es-toolkit/compat/throttle': path.resolve('src/lib/es-toolkit-compat/throttle.js'),
      'es-toolkit/compat/uniqBy': path.resolve('src/lib/es-toolkit-compat/uniqBy.js'),
    }
  }
})


