import wasmUrl from "/wasm/main.wasm?url"

export const wasmBrowserInstantiate = async (wasmModuleUrl, importObject) => {
  let response
  if(WebAssembly.instantiateStreaming) {
    response = await WebAssembly.instantiateStreaming(
      fetch(wasmModuleUrl),
      importObject
    )
  } else {
    const fetchAndInstantiateTask = async () => {
      const wasmArrayBuffer = await fetch(wasmModuleUrl).then(response =>{
        response.arrayBuffer()
      })
      return WebAssembly.instantiate(wasmArrayBuffer, importObject)
    }
    response = await fetchAndInstantiateTask()
  }
  return response
}

const go = new Go()

export const initWasm = async () => {
  let wasmModule = await wasmBrowserInstantiate(wasmUrl, go.importObject)
  go.run(wasmModule.instance)
}

// export const addWasm = (a, b) => {
//   let res
//   try {
//     res = window.expression(a, b)
//   } catch (e) {
//     res = 'Error'
//   }
//   return res
// }