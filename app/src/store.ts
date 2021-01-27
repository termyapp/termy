import produce from 'immer'
import { v4 } from 'uuid'
import create, { UseStore } from 'zustand'
import { devtools, redux } from 'zustand/middleware'
import type { CellType, Message, ThemeMode } from '../types'
import { api, getTheme, ipc, isDev } from './utils'

const getDefaultCell = (): Omit<CellType, 'active'> => {
  const id = v4()
  return {
    id,
    currentDir: api('home'),
    value: '',
    type: null,
    status: null,
  }
}

// todo: init cell input with `help` or `guide` on first launch
const initialState = (() => {
  const cell = { ...getDefaultCell(), value: 'shortcuts' }
  const tab = v4()

  return {
    tabs: {
      [tab]: {
        cells: {
          [cell.id]: cell,
        },
        activeCell: cell.id,
      },
    },
    activeTab: tab,
    theme: getTheme(isDev ? '#fff' : '#000'), // todo: refactor theme and fix circular dependency error
  }
})()

const reducer = (state: State, action: Action) => {
  return produce(state, draft => {
    console.log(action.type.toUpperCase(), action)
    switch (action.type) {
      case 'new-cell': {
        const cell = getDefaultCell()
        const activeTab = draft.tabs[draft.activeTab]

        activeTab.cells[cell.id] = cell
        activeTab.activeCell = cell.id
        break
      }
      case 'new-tab': {
        const tab = v4()
        const cell = getDefaultCell()

        draft.tabs[tab] = { cells: { [cell.id]: cell }, activeCell: cell.id }
        draft.activeTab = tab
        break
      }
      case 'remove-cell': {
        const id = action.id || draft.tabs[draft.activeTab].activeCell
        const tabs = Object.keys(draft.tabs)
        const cells = Object.keys(draft.tabs[draft.activeTab].cells)

        if (tabs.length > 1) {
          if (cells.length > 1) {
            delete draft.tabs[draft.activeTab].cells[id]
            draft.tabs[draft.activeTab].activeCell = nextOrLast(id, cells)
          }
          // if it is the last remaining cell in the active tab, remove the tab
          else {
            delete draft.tabs[draft.activeTab]
            draft.activeTab = nextOrLast(draft.activeTab, tabs)
          }
        } else {
          // prevent removing the last remaining cell
          if (cells.length > 1) {
            draft.tabs[draft.activeTab].activeCell = nextOrLast(id, cells)
            delete draft.tabs[draft.activeTab].cells[id]
          }
        }

        break
      }
      case 'remove-tab': {
        const id = action.id || draft.activeTab
        const tabs = Object.keys(draft.tabs)

        // prevent removing the last tab
        if (tabs.length > 1) {
          delete draft.tabs[id]
          draft.activeTab = nextOrLast(id, tabs)
        }
        break
      }
      case 'focus-cell': {
        let id = action.id

        if (id === 'next' || id === 'previous') {
          id = nextOrPrevious(
            id,
            draft.tabs[draft.activeTab].activeCell,
            Object.keys(draft.tabs[draft.activeTab].cells),
          )
        }

        draft.tabs[draft.activeTab].activeCell = id
        break
      }
      case 'focus-tab': {
        let id = action.id

        if (id === 'next' || id === 'previous') {
          id = nextOrPrevious(id, draft.activeTab, Object.keys(draft.tabs))
        }

        draft.activeTab = id
        break
      }
      case 'set-cell': {
        draft.tabs[draft.activeTab].cells[action.id] = {
          ...draft.tabs[draft.activeTab].cells[action.id],
          ...action.cell,
        }
        break
      }
      case 'run-cell': {
        const cell = draft.tabs[draft.activeTab].cells[action.id]
        if (!cell || !action.input || cell.status === 'running') return

        // reset
        cell.status = null

        const message: Message = {
          type: 'run-cell',
          id: cell.id,
          input: action.input,
          currentDir: cell.currentDir,
        }

        ipc.send('message', message)
        break
      }
      case 'set-theme': {
        draft.theme = getTheme(action.theme)
        break
      }
    }
  })
}

type State = typeof initialState

// todo: https://artsy.github.io/blog/2018/11/21/conditional-types-in-typescript/
type Action =
  | { type: 'new-cell' }
  | { type: 'new-tab' }
  | { type: 'remove-cell'; id?: string }
  | { type: 'remove-tab'; id?: string }
  | { type: 'set-cell'; id: string; cell: Partial<CellType> }
  | { type: 'run-cell'; id: string; input: string }
  | { type: 'set-theme'; theme: ThemeMode }
  | { type: 'focus-cell'; id: string | 'next' | 'previous' }
  | { type: 'focus-tab'; id: string | 'next' | 'previous' }

// @ts-ignore
const useStore: UseStore<
  State & { dispatch: (action: Action) => void }
> = create(devtools(redux(reducer, initialState)))

export default useStore

const nextOrLast = (key: string, keys: string[]) => {
  const index = keys.indexOf(key)
  const newIndex = index === keys.length - 1 ? index - 1 : index + 1
  return keys[newIndex]
}

const nextOrPrevious = (
  direction: 'next' | 'previous',
  key: string,
  keys: string[],
) => {
  if (keys.length <= 1) return key

  const index = keys.indexOf(key)
  let newIndex
  if (direction === 'next') {
    newIndex = keys.length - 1 > index ? index + 1 : 0
  } else {
    newIndex = index > 0 ? index - 1 : keys.length - 1
  }
  return keys[newIndex]
}
