import { app, BrowserWindow, shell } from 'electron'
import installExtension, {
  REACT_DEVELOPER_TOOLS,
  REDUX_DEVTOOLS,
} from 'electron-devtools-installer'
import isDev from 'electron-is-dev'
import electronLocalshortcut from 'electron-localshortcut'
import path from 'path'

const isMac = process.platform === 'darwin'

export interface TermyWindow extends BrowserWindow {
  runningCells: { [key: string]: any }
}

// todo: menu — include shift in zoom accelerators
export const createWindow = async (): Promise<TermyWindow> => {
  const window = new BrowserWindow({
    minWidth: 370,
    minHeight: 190,
    title: 'Termy',
    titleBarStyle: 'hiddenInset',
    frame: isMac,
    transparent: isMac,
    acceptFirstMouse: true,
    webPreferences: {
      preload: getPreloadPath(),
      contextIsolation: true,
    },
  }) as TermyWindow
  window.runningCells = {}

  await window.loadURL(getUrl())

  // todo: Window.updateAppAboutWindowInfo(window)
  Window.handleNewWindow(window)
  Window.setupDevTools(window)
  Window.disableRefresh(window)

  return window
}

const Window = {
  // updateAppAboutWindowInfo: (window: TermyWindow): void => {
  //   // todo: listen for settings/ismaximized onchange and update accordingly
  //   console.log('here', info)
  // },
  handleNewWindow: (window: TermyWindow): void => {
    // open urls in external browser
    window.webContents.on('new-window', (event, url) => {
      const protocol = new URL(url).protocol
      if (protocol === 'http:' || protocol === 'https:') {
        event.preventDefault()
        shell.openExternal(url)
      }
    })
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
  isDev
    ? 'http://localhost:4242'
    : `file://${path.join(app.getAppPath(), 'build/index.html')}`

const getPreloadPath = () =>
  path.resolve(app.getAppPath(), isDev ? './preload.js' : 'build/preload.js')
