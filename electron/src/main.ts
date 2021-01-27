import { app, BrowserWindow, Menu } from 'electron'
import setupMessages from './messages'
import { createWindow } from './window'
import fixPath from 'fix-path'
import contextMenu from 'electron-context-menu'

// // fixes: https://github.com/termyapp/termy/issues/8
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

  // prevent window from closing (until we don't have a proper menu window)
  const menu = Menu.getApplicationMenu()
  if (menu) {
    // @ts-ignore
    const fileMenu = menu.items.find(item => item.role === 'filemenu')
    if (fileMenu) {
      fileMenu.visible = false
      Menu.setApplicationMenu(menu)
    }
  }
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

  app.on('activate', async function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) await createWindow()
  })
}
