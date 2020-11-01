import { ipcMain } from 'electron'
import native from '../native'
import {
  FrontendMessage,
  ServerDataMessage,
  ServerStatusMessage,
} from '../types'

export default () => {
  ipcMain.on('message', (event, message) => {
    console.log('On Message', message)
    event.returnValue = handleMessage(event, message)
  })
}

const runningCells: { [key: string]: any } = {}

const handleMessage = (
  event: Electron.IpcMainEvent,
  message: FrontendMessage,
) => {
  switch (message.type) {
    // always return from cases

    case 'api': {
      const result = native.api(message.command)
      console.log('api result', result)
      return result
    }
    case 'get-suggestions': {
      const suggestions = native.getSuggestions(
        message.data.input,
        message.data.currentDir,
      )
      // console.log('suggestions', suggestions)
      return suggestions
    }
    case 'run-cell': {
      const { id, input, currentDir } = message.data

      const sendOutput = (...args: any[]) => {
        console.log('out', args)

        const message: ServerDataMessage = {
          id,
          data: args[1] as string,
        }
        event.sender.send(`data-${id}`, message)
      }

      const sendStatus = (...args: [null, number, number | undefined]) => {
        const [_, type, status] = args
        event.sender.send(`status-${id}`, {
          id,
          type: type === 0 ? 'PTY' : 'API',
          status: typeof status === 'undefined' ? -1 : status, // -1 = running
        } as ServerStatusMessage)
      }

      const sendStdin = native.runCell(
        id,
        input,
        currentDir,
        sendOutput,
        sendStatus,
      )
      runningCells[id] = sendStdin
      return
    }
    case 'send-stdin': {
      // only used by PTY
      const { id, key } = message.data

      const external = runningCells[id]
      if (external) {
        native.sendStdin(external, key)
      }
      return
    }
  }
}
