import { BrowserWindow, app } from 'electron'
import path from 'path'

export class Window {
  public readonly window: BrowserWindow

  constructor() {
    this.window = this.createWindow()
  }

  createWindow(): BrowserWindow {
    const window = new BrowserWindow({
      width: 1200,
      height: 1000,
      webPreferences: {
        preload: path.resolve(app.getAppPath(), './preload.js'),
        nodeIntegration: false,

        // todo: https://www.electronjs.org/docs/tutorial/context-isolation
        // currently this would break the ipc communcication
        // contextIsolation: true,
        // worldSafeExecuteJavaScript: true,
      },
    })

    // Load our index.html (not the react one)
    window.loadURL('http://localhost:3000')

    window.webContents.openDevTools()

    return window
  }
}
