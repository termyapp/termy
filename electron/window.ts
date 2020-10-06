import { app, BrowserWindow } from 'electron'

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
        nodeIntegration: true,
      },
    })

    // Load our index.html (not the react one)
    window.loadFile(`index.html`)

    window.webContents.openDevTools()

    return window
  }
}
