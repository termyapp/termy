const { ipcRenderer, contextBridge } = require('electron')

const INVOKE = 'INVOKE'
const INVOKE_SYNC = 'INVOKE_SYNC'

contextBridge.exposeInMainWorld('ipc', {
  invoke: (...args) => {
    console.time(INVOKE)
    const result = ipcRenderer.invoke('ipc', ...args)
    console.timeEnd(INVOKE)
    return result
  },
  sync: (...args) => {
    console.time(INVOKE_SYNC)
    const result = ipcRenderer.sendSync('ipc-sync', ...args)
    console.timeEnd(INVOKE_SYNC)
    return result
  },
  on: (...args) => ipcRenderer.on(...args),
  removeAllListeners: (...args) => ipcRenderer.removeAllListeners(...args),
})
