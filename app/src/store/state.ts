import type { darkTheme } from '@src/themes'
import { v4 } from 'uuid'
import type { ICell } from '../../types'
import { getTheme, isDev } from '../utils'
import { getDefaultCell } from './helpers'

export interface ITab {
  cells: string[]
  activeCell: string
}

export interface IState {
  tabs: {
    [id: string]: ITab
  }
  activeTab: string
  cells: {
    [id: string]: ICell
  }
  theme: typeof darkTheme
}

export const createState = (): IState => {
  const tab = v4()
  const cell = { ...getDefaultCell(), value: 'shortcuts' }

  const state: IState = {
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
}
