import setupMessages from './messages'
import { app, BrowserWindow } from 'electron'
import { createWindow } from './window'
import installExtension, {
  REACT_DEVELOPER_TOOLS,
} from 'electron-devtools-installer'

app.allowRendererProcessReuse = true // default true in >=9

let mainWindow: BrowserWindow

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  createMainWindow()
  setupMessages()
  setupDevtools()
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

const setupDevtools = async () => {
  try {
    // doesn't on >=9 work: https://github.com/electron/electron/issues/23662
    // this is the only reason we're using electron 8
    const name = await installExtension(REACT_DEVELOPER_TOOLS)
    console.log(`Added Extension:  ${name}`)
  } catch (error) {
    console.error(error)
  }
}
