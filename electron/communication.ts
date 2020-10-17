import native from '../native'
import { Message } from '../types'

export const messageHandler = (message: Message) => {
  switch (message.type) {
    case 'GET_SUGGESTIONS': {
      const suggestions = native.getSuggestions(
        message.data.input,
        message.data.currentDir,
      )
      console.log('suggestions', suggestions)
      return suggestions
    }
    case 'PROCESS': {
      // todo
    }
  }
}
