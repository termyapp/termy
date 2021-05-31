import { v4 } from 'uuid'
import type { Cell, Themes, WindowInfo } from '@types'
import { ipc } from '../utils'
import { getDefaultCell } from './helpers'

const TERMY_STATE = 'TERMY_STATE'

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
  theme: Themes
}

export const getState = (): State => {
  const item = window.localStorage.getItem(TERMY_STATE)
  if (item) {
    try {
      console.debug('restoring state from local storage')
      const state: State = JSON.parse(item)
      for (const id in state.cells) {
        state.cells[id].status = null
        state.cells[id].type = null
      }
      return state
    } catch {
      console.error("couldn't restore state from local storage")
      return getDefaultState()
    }
  } else {
    return getDefaultState()
  }
}

export const getDefaultState = (): State => {
  const tab = v4()
  const cell = getDefaultCell()

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
    theme: 'light',
  }

  return state
}

export const saveState = (state: Readonly<State>) => {
  window.localStorage.setItem(TERMY_STATE, JSON.stringify(state))
}
