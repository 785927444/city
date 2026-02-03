import { defineConfig, loadEnv, ConfigEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { fileURLToPath, URL } from 'node:url'
import ReactivityTransform from '@vue-macros/reactivity-transform/vite'
import autoprefixer from 'autoprefixer'
import cnjmpostcsspxtoviewport from 'cnjm-postcss-px-to-viewport'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'

export default defineConfig((mode: ConfigEnv) => {
  const env = loadEnv(mode.mode, process.cwd())
  return {
    plugins: [
      vue(),
      ReactivityTransform(),
      AutoImport({
        imports: ['vue', 'vue-router', 'pinia'],
        resolvers: [
          ElementPlusResolver(),
          IconsResolver({
            prefix: 'Icon',
            enabledCollections: ['ep'],
          }),
        ],
        dts: path.resolve(path.resolve(__dirname, 'src'), 'auto-imports.d.ts'),
      }),
      Components({
        resolvers: [
          ElementPlusResolver(),
          IconsResolver({
            enabledCollections: ['ep'],
          }),
        ],
        dts: path.resolve(path.resolve(__dirname, 'src'), 'components.d.ts'),
      }),
      Icons({
        autoInstall: true,
        compiler: 'vue3',
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
      extensions: ['.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
    },
    base: '/',
    build: {
      target: 'esnext',
      outDir: env.VITE_BUILD_NAME,
      sourcemap: false,
      chunkSizeWarningLimit: 10000,
      emptyOutDir: true,
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
    },
    server: {
      host: '0.0.0.0',
      port: parseInt(env.VITE_PORT),
      open: true,
      cors: true,
      proxy: {
        [env.VITE_BASE_APII]: {
          target: env.VITE_BASE_URLL,
          secure: false,
          changeOrigin: true,
        },
        [env.VITE_BASE_API]: {
          target: env.VITE_BASE_URL,
          secure: false,
          changeOrigin: true,
        },
        '/kb-api': {
          target: env.VITE_KB_URL || 'http://127.0.0.1:9010',
          secure: false,
          changeOrigin: true,
        },
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
        },
      },
      postcss: {
        plugins: [
          autoprefixer({
            overrideBrowserslist: [
              '> 0.5%',
              'last 2 versions',
              'not dead',
              'Android 4.1',
              'iOS 7.1',
              'ie >= 8',
              'Chrome >= 88',
              'Firefox >= 78',
              'Safari >= 12.1',
              'Edge >= 88',
            ],
            grid: true,
          }),
          cnjmpostcsspxtoviewport({
            unitToConvert: 'px',
            viewportWidth: 1920,
            unitPrecision: 6,
            propList: ['*'],
            viewportUnit: 'vw',
            fontViewportUnit: 'vw',
            selectorBlackList: ['ignore-'],
            minPixelValue: 1,
            mediaQuery: true,
            replace: true,
            exclude: [],
            landscape: false,
          }),
        ],
      },
    },
  }
})
