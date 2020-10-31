import { useEffect } from 'react'
import {
  ServerChannelType,
  ServerDataMessage,
  ServerStatusMessage,
} from '../../types'
import { ipc } from './'

export const useListener = (
  channel: ServerChannelType,
  id: string,
  eventHandler: (message: any) => void, // todo: conditional type
  deps = [],
) => {
  useEffect(() => {
    // receive events from server
    ipc.on(
      channel,
      (event, message: ServerStatusMessage | ServerDataMessage) => {
        console.log('received message', message)
        if (message.id === id) {
          eventHandler(message)
        }
      },
    )
  }, [channel, id, eventHandler, ...deps])
}
