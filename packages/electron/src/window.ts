import { app, BrowserWindow, shell } from 'electron'
import installExtension, {
  REACT_DEVELOPER_TOOLS,
  REDUX_DEVTOOLS,
} from 'electron-devtools-installer'
import isDev from 'electron-is-dev'
import electronLocalshortcut from 'electron-localshortcut'
import path from 'path'
import type { WindowInfo } from '@shared'
import { getWindowPosition, recordWindowPosition } from './config'

const isMac = process.platform === 'darwin'

export interface TermyWindow extends BrowserWindow {
  runningCells: { [key: string]: any }
}

// todo: menu — include shift in zoom accelerators
export const createWindow = async (): Promise<TermyWindow> => {
  const { position, size } = getWindowPosition()
  const window = new BrowserWindow({
    title: 'Termy',
    titleBarStyle: 'hiddenInset',
    frame: isMac,
    transparent: isMac,
    acceptFirstMouse: true,
    icon: getIcon(),
    webPreferences: {
      preload: getPreloadPath(),
      contextIsolation: true,
    },
    width: size[0],
    height: size[1],
    x: position[0] === -1 ? undefined : position[0], // if it's `-1` then don't set and
    y: position[1] === -1 ? undefined : position[1], // let electron center it by default
    minWidth: 370,
    minHeight: 190,
  }) as TermyWindow
  window.runningCells = {}

  await window.loadURL(getUrl())

  Window.updateWindowInfo(window)
  Window.handleNewWindow(window)
  Window.setupDevTools(window)
  Window.disableRefresh(window)
  recordWindowPosition(window)

  return window
}

const Window = {
  updateWindowInfo: (window: TermyWindow): void => {
    window.on('maximize', () => {
      window.webContents.send('window-info', {
        isMaximized: true,
      } as WindowInfo)
    })
    window.on('unmaximize', () => {
      window.webContents.send('window-info', {
        isMaximized: false,
      } as WindowInfo)
    })
  },
  handleNewWindow: (window: TermyWindow): void => {
    // open urls in external browser
    const openExternal = (event: Electron.Event, url: string) => {
      if (url != window.webContents.getURL()) {
        event.preventDefault()
        shell.openExternal(url)
      }
    }
    window.webContents.on('will-navigate', openExternal)
    window.webContents.on('new-window', openExternal)
  },
  setupDevTools: async (window: TermyWindow) => {
    if (isDev) {
      window.webContents.openDevTools()
      try {
        // todo:
        // const extensions = [REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS]
        // await installExtension(extensions, {
        //   loadExtensionOptions: { allowFileAccess: true },
        // })
      } catch (error) {
        console.error(error)
      }
    }
  },
  disableRefresh: (window: TermyWindow): void => {
    // until we don't have a custom menu
    window.on('focus', () => {
      electronLocalshortcut.register(
        window,
        ['CommandOrControl+R', 'CommandOrControl+Shift+R', 'F5'],
        () => {},
      )
    })

    window.on('blur', () => {
      electronLocalshortcut.unregisterAll(window)
    })
  },
}

const getUrl = () =>
  isDev ? 'http://localhost:4242' : `file://${path.join(app.getAppPath(), 'build/index.html')}`

const getPreloadPath = () =>
  path.resolve(app.getAppPath(), isDev ? './preload.js' : 'build/preload.js')

const getIcon = () =>
  process.platform === 'linux' ? path.resolve(app.getAppPath(), 'build/icon.png') : undefined
