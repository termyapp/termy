import { ipcMain, ipcRenderer } from 'electron'
import native from '../native'
import { Message, Payload } from '../types'

export default () => {
  ipcMain.on('message', (event, message) => {
    console.log('message: ', message)
    event.returnValue = handleMessage(event, message)
  })
}

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
      const sendChunk = (...args: any[]) => {
        console.log('received: ', args)
        // first arg is `null` for some reason
        event.sender.send('event', {
          id,
          chunk: Uint8Array.from(args.slice(1)),
        } as Payload)
      }
      native.newCommand(id, input, currentDir, sendChunk)
    }
  }
}
