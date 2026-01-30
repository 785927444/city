const { app, protocol, BrowserWindow, Menu, globalShortcut} = require('electron')
const path = require('path')
let mainWindow
app.disableHardwareAcceleration()
function createWindow() {
   Menu.setApplicationMenu(null)
   mainWindow = new BrowserWindow({
	// fullscreen: true,
	minWidth: 1100,
	minHeight: 610,
		webPreferences: {
			contextIsolation: true,
			enableRemoteModule: false,
			nodeIntegration: false,
			webSecurity: true,		
			preload: path.join(__dirname, 'preload.js'),
		}
  })
  mainWindow.maximize()
  globalShortcut.register('CommandOrControl+Shift+i', () => {
    mainWindow.webContents.openDevTools()
  })
  globalShortcut.register('ESC', () => {
    mainWindow.setFullScreen(false);
	  mainWindow.maximize()
  })
  globalShortcut.register("F5", () => {
	  mainWindow?.reload();
  })
  globalShortcut.register("ctrl+F5", () => {
		app.relaunch();
		app.exit();
  })
  globalShortcut.register("ctrl+X", () => {
		app.exit();
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
  // and load the index.html of the app.
  mainWindow.loadFile('p90web-yqjc/index.html')
  // mainWindow.loadURL('http://localhost:3000/')
 
	// Open the DevTools.
	// mainWindow.webContents.openDevTools()
}
 
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
	createWindow()
 
	app.on('activate', function () {
		// On macOS it's common to re-create a window in the app when the
		// dock icon is clicked and there are no other windows open.
		if (BrowserWindow.getAllWindows().length === 0) createWindow()
	})
})

app.on('will-quit', () => {
	globalShortcut.unregister('CommandOrControl+X')
	globalShortcut.unregisterAll()
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
	if (process.platform !== 'darwin') app.quit()
})