import type { Message } from '@types'
import type { IpcRenderer } from 'electron'

interface Ipc {
  invoke: (message: Message) => Promise<any>
  sync: (message: Message) => any
  on: IpcRenderer['on']
  removeAllListeners: IpcRenderer['removeAllListeners']
}

declare global {
  interface Window {
    ipc: Ipc
  }
}

export const { ipc } = window
