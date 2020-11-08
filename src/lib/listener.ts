import { useEffect } from 'react'
import { ServerDataMessage, ServerStatusMessage } from '../../types'
import { ipc } from './'

export const useListener = (
  channel: string,
  eventHandler: (message: any) => void, // todo: conditional type
  deps = [] as any[],
) => {
  // receive events from server
  useEffect(() => {
    const listener = (
      event: any,
      message: ServerStatusMessage | ServerDataMessage,
    ) => {
      console.log('received message', message)
      eventHandler(message)
    }

    ipc.on(channel, listener)

    return () => {
      ipc.removeListener(channel, listener)
    }
  }, [channel, eventHandler, ...deps])
}
