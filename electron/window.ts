import { app, BrowserWindow, shell } from 'electron'
import isDev from 'electron-is-dev'
import installExtension, {
  REACT_DEVELOPER_TOOLS,
  REDUX_DEVTOOLS,
} from 'electron-devtools-installer'

import path from 'path'

export const createWindow = async (): Promise<BrowserWindow> => {
  const window = new BrowserWindow({
    width: 1200,
    height: 1000,
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

  await window.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${path.join(app.getAppPath(), 'build/index.html')}`,
  )

  // open urls in external browser
  window.webContents.on('new-window', (e, url) => {
    e.preventDefault()
    shell.openExternal(url)
  })

  if (isDev) {
    window.webContents.openDevTools()
    window.webContents.on('did-frame-finish-load', async () => {
      try {
        // doesn't on >=9 work: https://github.com/electron/electron/issues/23662
        // this is the only reason we're using electron 8
        await installExtension(REACT_DEVELOPER_TOOLS)
        await installExtension(REDUX_DEVTOOLS)
      } catch (error) {
        console.error(error)
      }
    })
  }

  return window
}
