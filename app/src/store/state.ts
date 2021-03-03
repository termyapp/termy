import type { darkTheme } from '@src/themes'
import { v4 } from 'uuid'
import type { Cell, WindowInfo } from '../../types'
import { getTheme, ipc, isDev } from '../utils'
import { getDefaultCell } from './helpers'

export interface Tab {
  cells: string[]
  activeCell: string
}

export interface State {
  windowInfo: WindowInfo
  tabs: {
    [id: string]: Tab
  }
  activeTab: string
  cells: {
    [id: string]: Cell
  }
  theme: typeof darkTheme
}

export const getDefaultState = (): State => {
  const item = window.localStorage.getItem(TERMY_STATE)
  if (item) {
    const state = JSON.parse(item)
    console.info('Restoring state from local storate', state)
    return state
  } else {
    return defaultState
  }
}

export const saveState = (value: string) => {
  window.localStorage.setItem(TERMY_STATE, value)
}

const TERMY_STATE = 'TERMY_STATE'

const defaultState: State = (() => {
  const tab = v4()
  const cell = { ...getDefaultCell(), value: 'shortcuts' }

  const state: State = {
    windowInfo: ipc.sync({ type: 'get-window-info' }) as WindowInfo,
    tabs: {
      [tab]: {
        cells: [cell.id],
        activeCell: cell.id,
      },
    },
    activeTab: tab,
    cells: {
      [cell.id]: cell,
    },
    theme: getTheme(isDev ? '#fff' : '#000'), // todo: refactor theme and fix circular dependency error
  }

  return state
})()
