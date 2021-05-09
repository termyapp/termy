import { ipc } from '@src/utils'
import { useEffect } from 'react'

export default function useListener(
  channel: string,
  listener: (_event: any, message: any) => void,
  deps = [] as any[],
) {
  // receive events from server
  useEffect(() => {
    ipc.on(channel, listener)

    return () => {
      ipc.removeAllListeners(channel)
    }
  }, [channel, ...deps])
}
