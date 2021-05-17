import { app, BrowserWindow } from 'electron'
import contextMenu from 'electron-context-menu'
import fixPath from 'fix-path'
import { createWindow } from './window'
import { initIpc } from './ipc'
import { autoUpdater } from 'electron-updater'

function init() {
  // fixes: https://github.com/termyapp/termy/issues/8
  fixPath()

  // https://www.npmjs.com/package/electron-context-menu
  contextMenu()

  app.on('ready', () => {
    initIpc()
    createWindow()
    autoUpdater.checkForUpdatesAndNotify()
  })

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  app.on('window-all-closed', () => {
    // always quit until we don't have multiple windows
    // if (process.platform !== 'darwin') {
    // }
    app.quit()
  })
}

init()
