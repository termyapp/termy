const { ipcRenderer, contextBridge } = require('electron')

contextBridge.exposeInMainWorld('ipc', {
  invoke: (...args) => ipcRenderer.invoke('ipc', ...args),
  sync: (...args) => ipcRenderer.sendSync('ipc-sync', ...args),
  on: (...args) => ipcRenderer.on(...args),
  removeAllListeners: (...args) => ipcRenderer.removeAllListeners(...args),
})
