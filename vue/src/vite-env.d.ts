/// <reference types="vite/client" />
declare module "*.vue" {
  import type { DefineComponent } from "vue"
  const vueComponent: DefineComponent<{}, {}, any>
  export default vueComponent
}
declare var $ref: any;
declare module '*.js'
declare module '*.tsx'

