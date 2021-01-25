import { useEffect } from 'react'
import { ipc } from '../utils'

export default function useListener(
  channel: string,
  listener: (_event: any, message: any) => void,
  deps = [] as any[],
) {
  // receive events from server
  useEffect(() => {
    ipc.on(channel, listener)

    return () => {
      ipc.removeListener(channel, listener)
    }
  }, [channel, listener, ...deps])
}
