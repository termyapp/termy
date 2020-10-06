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
    window.loadURL('http://localhost:8080')

    window.webContents.openDevTools()

    return window
  }
}
