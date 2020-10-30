import { ipcMain } from 'electron'
import native from '../native'
import { Message, Payload } from '../types'

export default () => {
  ipcMain.on('message', (event, message) => {
    console.log('On Message', message)
    event.returnValue = handleMessage(event, message)
  })
}

const runningProcesses = {}

const handleMessage = (event: Electron.IpcMainEvent, message: Message) => {
  switch (message.type) {
    case 'GET_SUGGESTIONS': {
      const suggestions = native.getSuggestions(
        message.data.input,
        message.data.currentDir,
      )
      // console.log('suggestions', suggestions)
      return suggestions
    }
    case 'NEW_COMMAND': {
      const { id, input, currentDir } = message.data

      const sendStdout = (...args: any[]) => {
        // console.log('received: ', args)
        // first arg is `null` for some reason
        event.sender.send('event', {
          id,
          chunk: Uint8Array.from(args.slice(1)),
        } as Payload)
      }

      const sendExitStatus = (...args: any[]) => {
        event.sender.send('event', {
          id,
          exitStatus: args[1],
        } as Payload)
      }

      const sendStdin = native.newCommand(
        id,
        input,
        currentDir,
        sendStdout,
        sendExitStatus,
      )
      runningProcesses[id] = sendStdin
      return
    }
    case 'STDIN': {
      const { id, key } = message.data

      const external = runningProcesses[id]
      if (external) {
        native.sendStdin(external, key)
      }
    }
  }
}
