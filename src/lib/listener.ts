import { useEffect } from 'react'
import type { ServerMessage } from '../../types'
import { ipc } from './'

export const useListener = (
  channel: string,
  listener: (_event: any, message: ServerMessage) => void,
  deps = [] as any[],
) => {
  // receive events from server
  useEffect(() => {
    ipc.on(channel, listener)

    return () => {
      ipc.removeListener(channel, listener)
    }
  }, [channel, listener, ...deps])
}
