import { ipcMain } from 'electron'
import native from '../native'
import { Message } from '../types'

export default () => {
  ipcMain.on('message', (event, message) => {
    console.log('message: ', message)
    event.returnValue = handleMessage(message)
  })
}

const handleMessage = (message: Message) => {
  switch (message.type) {
    case 'GET_SUGGESTIONS': {
      const suggestions = native.getSuggestions(
        message.data.input,
        message.data.currentDir,
      )
      console.log('suggestions', suggestions)
      return suggestions
    }
    case 'NEW_COMMAND': {
      const { id, input, currentDir } = message.data
      const sendStdout = (...args: any[]) => {
        // first arg is `null` for some reason
        console.log('received: ', args)
        // ipcMain.emit('event', { id, chunk })
      }
      native.newCommand(id, input, currentDir, sendStdout)
    }
  }
}
