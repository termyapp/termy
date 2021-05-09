import type { BrowserWindow } from 'electron'
import Store from 'electron-store'
import { isValidPosition } from './utils'

export const defaults = {
  windowPosition: [-1, -1],
  windowSize: [800, 600],
}

export const getWindowPosition = (): { position: number[]; size: number[] } => {
  const size = config.get('windowSize', defaults.windowSize)

  let position = config.get('windowPosition', defaults.windowPosition)
  if (!isValidPosition(position as [number, number])) {
    position = defaults.windowPosition
  }

  return { position, size }
}

export const recordWindowPosition = (window: BrowserWindow) => {
  window.on('close', () => {
    config.set('windowPosition', window.getPosition())
    config.set('windowSize', window.getSize())
  })
}

const config = new Store({ defaults })

export default config
