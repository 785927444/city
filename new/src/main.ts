import { createApp } from 'vue'
import App from './App.vue'
import pinia from './stores/pinia'
import stores from './stores'
import router from './router'
import { install } from './utils/common'
import { tree } from './utils/tree'
import { initWasm } from './wasm'
import '@/router/permission'
import '@/assets/styles/common.scss'
import '@/assets/styles/custom.scss'
import '@/assets/styles/element.scss'

// initWasm().then(()=>{
  const app = createApp(App);
  app.use(stores);
  app.use(install);
  app.use(tree);
  app.use(pinia);
  app.use(router);
  app.mount("#app");
// }).catch(err => {
//   console.error('Failed to load WASM module:', err);
// });
