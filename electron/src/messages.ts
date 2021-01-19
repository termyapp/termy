import { app, ipcMain } from 'electron'
import isDev from 'electron-is-dev'
import fs from 'fs'
import path from 'path'
import native from '../native'
import type { Message, ServerMessage } from '../shared'

export default () => {
  ipcMain.on('message', (event, message) => {
    console.log('message', message)
    event.returnValue = handleMessage(event, message)
  })

  ipcMain.handle('suggestions', async (event, input, currentDir) => {
    const suggestions = await native.getSuggestions(input, currentDir)
    console.log(input, currentDir, suggestions)
    return suggestions
  })
}

const runningCells: { [key: string]: any } = {}

const handleMessage = (event: Electron.IpcMainEvent, message: Message) => {
  switch (message.type) {
    case 'api': {
      const result = native.api(message.command)
      console.log('api result', result)
      return result
    }
    case 'run-cell': {
      const { id, input, currentDir } = message

      const serverMessage = (...args: [null, ServerMessage]) => {
        console.log('received message', args)

        const [error, receivedMessage] = args

        if (error || !receivedMessage) {
          console.error('error receiving message:', args)
          return
        } else {
          if (receivedMessage.status && receivedMessage.status !== 'running') {
            // remover external fn since it's no longer running
            console.log('removing external fn for', id)
            delete runningCells[id]
          }

          event.sender.send(`message-${id}`, { ...receivedMessage, id })
        }

        return
      }

      const sendMessage = native.runCell(
        { id, input, currentDir },
        serverMessage,
      )

      runningCells[id] = sendMessage
      return
    }
    case 'frontend-message': {
      // only used by pty cells
      const external = runningCells[message.id]
      if (external) {
        native.frontendMessage(external, message)
      } else {
        console.warn('external callback does not exit for cell:', message.id)
      }
      return
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
        return content
      } catch {
        // file does not exist
        return null
      }
    }
  }
}
