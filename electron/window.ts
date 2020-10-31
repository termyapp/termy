import { app, BrowserWindow, shell } from 'electron'
import isDev from 'electron-is-dev'
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

  window.webContents.openDevTools()

  await window.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${path.join(app.getAppPath(), 'build/index.html')}`,
  )

  // open urls in external browser
  window.webContents.on('new-window', (e, url) => {
    console.log('here')
    e.preventDefault()
    shell.openExternal(url)
  })

  return window
}
