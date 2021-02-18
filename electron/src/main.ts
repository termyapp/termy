import { app, BrowserWindow, Menu } from 'electron'
import contextMenu from 'electron-context-menu'
import fixPath from 'fix-path'
import setupMessages from './messages'
import { createWindow } from './window'
import electronLocalshortcut from 'electron-localshortcut'

// fixes: https://github.com/termyapp/termy/issues/8
fixPath()

// https://www.npmjs.com/package/electron-context-menu
const dispose = contextMenu()

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
  // always quit until we don't have multiple windows
  // if (process.platform !== 'darwin') {
  // }
  app.quit()
})

const createMainWindow = async () => {
  mainWindow = await createWindow()
  disableRefresh(mainWindow)

  app.on('activate', async function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) await createWindow()
  })

  return mainWindow
}

// until we don't have a custom menu
const disableRefresh = (window: BrowserWindow) => {
  window.on('focus', () => {
    electronLocalshortcut.register(
      window,
      ['CommandOrControl+R', 'CommandOrControl+Shift+R', 'F5'],
      () => {},
    )
  })

  window.on('blur', () => {
    electronLocalshortcut.unregisterAll(window)
  })
}
