import type {
  FrontendMessage,
  Message,
  RunCell,
  ServerMessage,
  WindowAction,
  WindowInfo,
} from '@shared'
import { app, BrowserWindow, ipcMain } from 'electron'
import isDev from 'electron-is-dev'
import type { IpcMainInvokeEvent } from 'electron/renderer'
import fs from 'fs'
import path from 'path'
import native from '../../native'
import type { TermyWindow } from './window'

export const initIpc = (): any | Promise<any> => {
  ipcMain.handle('ipc', async (event, message: Message) => {
    console.debug('IPC: ', message)
    switch (message.type) {
      case 'get-window-info': {
        const window = getWindow(event)
        const info: WindowInfo = {
          isMaximized: window.isMaximized(),
        }
        return info
      }
      case 'api': {
        const result = native.api(message.command)
        return result
      }
      case 'autocomplete': {
        const suggestions = await native.autocomplete(
          message.value,
          message.currentDir,
        )

        return suggestions
      }
      case 'run-cell': {
        return handleRunCell(message, getWindow(event))
      }
      case 'frontend-message': {
        return handleFrontendMessage(message, getWindow(event))
      }
      // todo: move tldr and write to native (api?)
      case 'tldr': {
        const { command } = message
        try {
          const content = fs.readFileSync(
            path.resolve(
              app.getAppPath(),
              isDev
                ? `../../external/tldr/pages/common/${command}.md`
                : `../../tldr/common/${command}.md`,
            ),
            { encoding: 'utf-8' },
          )
          return content
        } catch {
          // file does not exist
          return null
        }
      }
      case 'write': {
        const { path, value } = message
        fs.writeFile(path, value, err => {
          console.error('Error while writing to file: err')
        })
        break
      }
      case 'window-action': {
        return handleWindowAction(message.action, getWindow(event))
      }
      default: {
        // @ts-ignore
        console.error('Invalid message type: ' + message.type)
      }
    }
  })

  // todo: handle sync stuff better
  ipcMain.on('ipc-sync', (event, message: Message) => {
    let returnValue = null
    console.debug('IPC-SYNC: ', message)
    switch (message.type) {
      case 'get-window-info': {
        const window = getWindow(event)
        const info: WindowInfo = {
          isMaximized: window.isMaximized(),
        }
        returnValue = info
        break
      }
      case 'api': {
        const result = native.api(message.command)
        returnValue = result
        break
      }
      case 'tldr': {
        const { command } = message
        try {
          const content = fs.readFileSync(
            path.resolve(
              app.getAppPath(),
              isDev
                ? `../../external/tldr/pages/common/${command}.md`
                : `../../tldr/common/${command}.md`,
            ),
            { encoding: 'utf-8' },
          )
          returnValue = content
          break
        } catch {
          // file does not exist
          returnValue = null
          break
        }
      }
      case 'write': {
        const { path, value } = message
        fs.writeFile(path, value, err => {
          console.error('Error while writing to file: err')
        })
        break
      }
      case 'window-action': {
        returnValue = handleWindowAction(message.action, getWindow(event))
        break
      }
      default: {
        // @ts-ignore
        console.error('Invalid message type: ' + message.type)
      }
    }
    event.returnValue = returnValue
  })
}

export const removeChannel = (id: string) => {
  ipcMain.removeHandler(id)
}

const getWindow = (event: IpcMainInvokeEvent): TermyWindow => {
  const window = BrowserWindow.fromId(event.frameId) as TermyWindow | null
  if (!window) throw new Error('Window not found')
  return window
}

const handleRunCell = (message: RunCell, window: TermyWindow): boolean => {
  const { id, value, currentDir } = message

  const serverMessage = (...args: [null, ServerMessage]) => {
    const [error, receivedMessage] = args

    if (error || !receivedMessage) {
      console.error('Error while receiving server message:', args)
      return
    } else {
      // send message to app
      window.webContents.send(id, receivedMessage)

      // remove external fn since if it's no longer running
      if (receivedMessage.status && receivedMessage.status !== 'running') {
        console.info('Removing `sendMessage` on cell:', id)
        delete window.runningCells[id]
      }
    }

    return
  }

  const sendMessage = native.runCell({ id, value, currentDir }, serverMessage)

  // set external callback function
  window.runningCells[id] = sendMessage

  return true
}

const handleFrontendMessage = (
  message: FrontendMessage,
  window: TermyWindow,
): boolean => {
  // only used by pty cells
  const external = window.runningCells[message.id]
  if (external) {
    native.frontendMessage(external, message)
    return true
  } else {
    console.warn('external callback does not exit for cell:', message.id)
    return false
  }
}

const handleWindowAction = (
  action: WindowAction,
  window: TermyWindow,
): boolean => {
  switch (action) {
    case 'minimize':
      window.minimize()
      return true
    case 'maximize':
      window.isMaximized() ? window.unmaximize() : window.maximize()
      return true
    case 'unmaximize':
      window.unmaximize()
      return true
    case 'close':
      window.close()
      return true
    default:
      console.error(`Invalid window action: ${action}`)
      return false
  }
}
