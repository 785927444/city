import { defineConfig, loadEnv, ConfigEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { fileURLToPath, URL } from 'node:url'
import ReactivityTransform from '@vue-macros/reactivity-transform/vite'
import autoprefixer from 'autoprefixer'
import cnjmpostcsspxtoviewport from 'cnjm-postcss-px-to-viewport'
import topLevelAwait from 'vite-plugin-top-level-await'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'

// https://vite.dev/config/
export default defineConfig((mode: ConfigEnv) => {
  const env = loadEnv(mode.mode, process.cwd());
  return { 
    plugins: [
      vue(),
      ReactivityTransform(),
      topLevelAwait({
        promiseExportName: '__tla',
        promiseImportName: (i:any) => `__tla_${i}`
      }),
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
        compiler: 'vue3'
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
      extensions: ['.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
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
          drop_debugger: true
        }
      },
      // rollupOptions: {
      //   output: {
      //     manualChunks(id:any) {
      //       if (id.includes('node_modules')) {
      //         return id.toString().split('node_modules/')[1].split('/')[0].toString();
      //       }
      //     },
      //     chunkFileNames: (chunkInfo:any) => {
      //       const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/') : [];
      //       const fileName = facadeModuleId[facadeModuleId.length - 2] || '[name]';
      //       return `js/${fileName}/[name].[hash].js`;
      //     }
      //   }
      // }
    },
    server: {
      host: "0.0.0.0",
      port: parseInt(env.VITE_PORT),
      open: true,
      cors: true,
      proxy: {
        [env.VITE_BASE_APII]: {
          target: env.VITE_BASE_URLL,
          secure: false, // 忽略https SSL 证书验证
          changeOrigin: true,
          // rewrite: (path) => path.replace(env.VITE_BASE_API, '')
        },
        [env.VITE_BASE_API]: {
          target: env.VITE_BASE_URL,
          secure: false, // 忽略https SSL 证书验证
          changeOrigin: true,
          // rewrite: (path) => path.replace(env.VITE_BASE_API, '')
        },
      }
    },
    // ******测试环境打印+debugger清除配置******
    // esbuild: {
    //   pure: ['console.log', 'debugger'] 
    // },
    // ******自适应配置******
    css: {
      preprocessorOptions: {
        scss: {
          api: "modern-compiler" // or 'modern'
        }
      },
      postcss: {
        plugins: [
          autoprefixer({ 
            overrideBrowserslist: [
              "> 0.5%",
              "last 2 versions",
              "not dead",
              "Android 4.1",
              "iOS 7.1",
              "ie >= 8",
              "Chrome >= 88", // 适配 Chrome 88 及以上版本
              "Firefox >= 78", // 适配 Firefox 78 及以上版本
              "Safari >= 12.1", // 适配 Safari 12.1 及以上版本
              "Edge >= 88" // 适配 Edge 88 及以上版本
            ],
            grid: true 
          }),
          cnjmpostcsspxtoviewport ({
            unitToConvert: 'px', // 要转化的单位
            viewportWidth: 1920, // UI设计稿的宽度
            unitPrecision: 6, // 转换后的精度，即小数点位数
            propList: ['*'], // 指定转换的css属性的单位，*代表全部css属性的单位都进行转换
            viewportUnit: 'vw', // 指定需要转换成的视窗单位，默认vw
            fontViewportUnit: 'vw', // 指定字体需要转换成的视窗单位，默认vw
            selectorBlackList: ['ignore-'], // 指定不转换为视窗单位的类名，
            minPixelValue: 1, // 默认值1，小于或等于1px则不进行转换
            mediaQuery: true, // 是否在媒体查询的css代码中也进行转换，默认false
            replace: true, // 是否转换后直接更换属性值
            // exclude: [/node_modules/], // 设置忽略文件，用正则做目录名匹配
            exclude: [],
            landscape: false // 是否处理横屏情况
          })
        ]
      }
    },
  }
})
