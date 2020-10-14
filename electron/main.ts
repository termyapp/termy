import { app, BrowserWindow, ipcMain, session } from 'electron'
import native from 'native'
import { createWindow } from './window'

let mainWindow

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  try {
    // https://github.com/electron/electron/issues/23662
    // await session.defaultSession.loadExtension(
    //   `/Users/martonlanga/Library/Application Support/Google/Chrome/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi`,
    // )
  } catch (error) {
    console.log(error)
  }

  mainWindow = await createWindow()

  app.on('activate', async function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) await createWindow()
  })

  ipcMain.on('message', (event, message) => {
    console.log('got an IPC message', message)
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

console.log(native.event('ey'))
