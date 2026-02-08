import screenfull from 'screenfull'
import configStore from '../stores/configStore'
const screen = {
    init() {
        window.addEventListener("keydown", screen.KeyDown, true)
        document.addEventListener("fullscreenchange", () => {
            configStore().ifFullScreen = !configStore().ifFullScreen 
        })
        document.addEventListener("mozfullscreenchange", () => {
            configStore().ifFullScreen = !configStore().ifFullScreen 
        })
        document.addEventListener("webkitfullscreenchange", () => {
            configStore().ifFullScreen = !configStore().ifFullScreen 
        })
        document.addEventListener("msfullscreenchange", () => {
            configStore().ifFullScreen = !configStore().ifFullScreen 
        })
    },
    KeyDown(event) {
        if (event.keyCode === 122) {
          event.returnValue = false;
          screen.fullscreen()
        }
    },
    fullscreen () {
        if (screenfull.isEnabled) {
            screenfull.toggle()
        }
    },
}

export default screen