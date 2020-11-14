import type { IpcRenderer } from 'electron'

declare global {
  interface Window {
    ipcRenderer: IpcRenderer
  }
}

export const { ipcRenderer: ipc } = window

export const api = (command: string) => {
  return ipc.sendSync('message', { type: 'api', command })
}
