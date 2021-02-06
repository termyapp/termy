import { app, BrowserWindow, ipcMain, shell } from 'electron'
import debug from 'electron-debug'
import installExtension, {
  REACT_DEVELOPER_TOOLS,
  REDUX_DEVTOOLS,
} from 'electron-devtools-installer'
import isDev from 'electron-is-dev'
import path from 'path'
import type { WindowMessage } from '../shared'

const isMac = process.platform === 'darwin'

// todo: menu — include shift in zoom accelerators
export const createWindow = async (): Promise<BrowserWindow> => {
  const window = new BrowserWindow({
    minWidth: 370,
    minHeight: 190,
    title: 'Termy',
    titleBarStyle: 'hiddenInset',
    frame: isMac,
    transparent: isMac,
    acceptFirstMouse: true,
    webPreferences: {
      preload: path.resolve(
        app.getAppPath(),
        isDev ? './preload.js' : 'build/preload.js',
      ),
      nodeIntegration: false,
      // todo: https://www.electronjs.org/docs/tutorial/context-isolation
      // currently this would break the ipc communcication
      // contextIsolation: true,
      // worldSafeExecuteJavaScript: true,
    },
  })

  ipcMain.on('window', (event, message: WindowMessage) => {
    console.log('window message', message)
    switch (message) {
      case 'minimize':
        window.minimize()
        break
      case 'maximize':
        window.maximize()
        break
      case 'unmaximize':
        window.unmaximize()
        break
      case 'close':
        window.close()
        break
      default:
        console.log(`Invalid window message: ${message}`)
        break
    }
  })

  await window.loadURL(
    isDev
      ? 'http://localhost:4242'
      : `file://${path.join(app.getAppPath(), 'build/index.html')}`,
  )

  // open urls in external browser
  window.webContents.on('new-window', (e, url) => {
    e.preventDefault()
    shell.openExternal(url)
  })

  window.webContents.on('did-frame-finish-load', async () => {
    if (isDev) {
      debug()

      window.webContents.openDevTools()
      try {
        // doesn't work on >=9: https://github.com/electron/electron/issues/23662
        // this is the only reason for using electron 8
        await installExtension(REACT_DEVELOPER_TOOLS)
        await installExtension(REDUX_DEVTOOLS)
      } catch (error) {
        console.error(error)
      }
    }
  })

  return window
}
