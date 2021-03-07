const { ipcRenderer, contextBridge } = require('electron')

const INVOKE = 'INVOKE'
const INVOKE_SYNC = 'INVOKE_SYNC'

contextBridge.exposeInMainWorld('ipc', {
  invoke: (...args) => {
    console.time(INVOKE)
    ipcRenderer.invoke('ipc', ...args)
    console.timeEnd(INVOKE)
  },
  sync: (...args) => {
    console.time(INVOKE_SYNC)
    ipcRenderer.sendSync('ipc-sync', ...args)
    console.timeEnd(INVOKE_SYNC)
  },
  on: (...args) => ipcRenderer.on(...args),
  removeAllListeners: (...args) => ipcRenderer.removeAllListeners(...args),
})
