import { app, BrowserWindow } from 'electron'

export class Window {
  public readonly window: BrowserWindow

  constructor() {
    this.window = this.createWindow()
  }

  createWindow(): BrowserWindow {
    const window = new BrowserWindow({
      width: 300,
      height: 600,
      webPreferences: {
        nodeIntegration: true,
      },
    })

    // Load our index.html
    window.loadURL(`file://${app.getAppPath()}/index.html`)

    window.webContents.openDevTools()

    return window
  }
}
