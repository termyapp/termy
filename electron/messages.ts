import { ipcMain } from 'electron'
import native from '../native'
import { Message, ServerMessage } from '../types'

export default () => {
  ipcMain.on('message', (event, message) => {
    console.log('On Message', message)
    event.returnValue = handleMessage(event, message)
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
    case 'get-suggestions': {
      const suggestions = native.getSuggestions(
        message.input,
        message.currentDir,
      )
      return suggestions
    }
    case 'run-cell': {
      const { id, input, currentDir } = message

      const serverMessage = (...args: [null, ServerMessage]) => {
        console.log('received message', args)

        const [error, receivedMessage] = args

        if (error || !receivedMessage) {
          console.error('Error receiving message:', args)
          return
        } else {
          if (receivedMessage.status && receivedMessage.status !== 'running') {
            // remover external fn since it's no longer running
            console.log('Removing external fn for', id)
            delete runningCells[id]
          }

          event.sender.send(`message-${id}`, { id, ...receivedMessage })
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
    case 'send-message': {
      // only used by pty cells
      const external = runningCells[message.id]
      if (external) {
        native.sendMessage(external, message)
      } else {
        console.warn('External callback does not exit for cell:', message.id)
      }
      return
    }
  }
}
