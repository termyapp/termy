import { app, BrowserWindow } from 'electron'
import setupMessages from './messages'
import { createWindow } from './window'
import fixPath from 'fix-path'
import { initUpdater } from './autoupdater'

// // fixes: https://github.com/termyapp/termy/issues/8
fixPath()

app.allowRendererProcessReuse = true // default true in >=9

let mainWindow: BrowserWindow

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  createMainWindow()
  setupMessages()
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

const createMainWindow = async () => {
  mainWindow = await createWindow()

  // When app has finished loading,
  // Check for updates
  mainWindow.webContents.on('did-finish-load', () => {
    initUpdater()
  })

  app.on('activate', async function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if(process.platform === "darwin") {
      if (BrowserWindow.getAllWindows().length === 0) await createWindow()
    }
  })
}
