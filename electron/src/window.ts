import { app, BrowserWindow, shell, Menu } from 'electron'
import debug from 'electron-debug'
import installExtension, {
  REACT_DEVELOPER_TOOLS,
  REDUX_DEVTOOLS,
} from 'electron-devtools-installer'
import isDev from 'electron-is-dev'
import path from 'path'

export const createWindow = async (): Promise<BrowserWindow> => {
  const window = new BrowserWindow({
    minWidth: 370,
    minHeight: 190,
    title: 'Termy',
    titleBarStyle: 'hiddenInset',
    frame: false,
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

  // create application menu
  // this menu will be hidden to the user,
  // but it fixes Ctrl+, Ctrl- in Windows and linux and Cmd+V Cmd+C in Mac
  const menu = Menu.buildFromTemplate([
    {
      label: 'Edit',
      submenu: [
        {
          label: 'You shouldn\'t see this!',
          enabled: false
        },
        {
          type: 'separator'
        },
        {
          role: 'copy'
        },
        {
          role: 'paste'
        },
        {
          role: 'zoomIn',
          accelerator: 'CmdOrCtrl++'
        },
        {
          role: 'zoomOut',
          accelerator: 'CmdOrCtrl+-'
        },
        {
          role: 'resetZoom',
          accelerator: 'CmdOrCtrl+0'
        }
      ]
    }
  ])

  window.setMenu(menu)
  window.setMenuBarVisibility(false)

  await window.loadURL(
    isDev
      ? 'http://localhost:8080'
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
        // doesn't on >=9 work: https://github.com/electron/electron/issues/23662
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
