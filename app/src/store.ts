import produce from 'immer'
import { v4 } from 'uuid'
import create, { UseStore } from 'zustand'
import { devtools, redux } from 'zustand/middleware'
import type { CellType, Message, ThemeMode } from '../types'
import { api, getTheme, ipc, isDev } from './utils'

type State = typeof initialState

// todo: https://artsy.github.io/blog/2018/11/21/conditional-types-in-typescript/
type Action =
  | { type: 'new' }
  | { type: 'remove'; id?: string }
  | { type: 'set-cell'; id: string; cell: Partial<CellType> }
  | { type: 'run-cell'; id: string; input: string }
  | { type: 'set-theme'; theme: ThemeMode }
  | { type: 'focus'; id: string }
  | { type: 'focus-next' }
  | { type: 'focus-previous' }

const getDefaultCell = (): Omit<CellType, 'focused'> => {
  const id = v4()
  return {
    id,
    currentDir: api('home'),
    value: '',
    type: null,
    status: null,
  }
}

export const focusCell = (id: string) => {
  const cell = document.getElementById(id)
  if (cell) {
    cell.focus()
  }
}

// todo: init cell input with `help` or `guide` on first launch
const initialState = (() => {
  const cell = getDefaultCell()
  cell.value = 'shortcuts'

  const tab = v4()
  return {
    tabs: {
      [tab]: {
        [cell.id]: cell,
      },
    },
    activeTab: tab,
    theme: getTheme(isDev ? '#fff' : '#000'), // todo: refactor theme and fix circular dependency error
    focus: cell.id,
  }
})()

const reducer = (state: State, action: Action) => {
  return produce(state, draft => {
    switch (action.type) {
      case 'new': {
        const cell = getDefaultCell()
        draft.tabs[draft.activeTab][cell.id] = cell
        draft.focus = cell.id
        break
      }
      case 'remove': {
        // todo: kill pty if running
        const id = action.id || draft.focus
        const tabs = Object.keys(draft.tabs)
        const cells = Object.keys(draft.tabs[draft.activeTab])

        let focus
        if (tabs.length > 1) {
          if (cells.length > 1) delete draft.tabs[draft.activeTab][id]
          // if it is the last remaining cell in the active tab, remove the tab
          else delete draft.tabs[draft.activeTab]
        } else {
          // prevent removing the last remaining cell
          if (cells.length > 1) delete draft.tabs[draft.activeTab][id]
        }

        // focus prev
        const keys = Object.keys(draft.tabs[draft.activeTab])
        const index = keys.findIndex(id => id === draft.focus)
        let newIndex
        if (index <= 0) {
          newIndex = keys[keys.length - 1]
        } else {
          newIndex = keys[index - 1]
        }
        draft.focus = newIndex
        break
      }
      case 'set-cell': {
        draft.tabs[draft.activeTab][action.id] = {
          ...draft.tabs[draft.activeTab][action.id],
          ...action.cell,
        }
        break
      }
      case 'run-cell': {
        const cell = draft.tabs[draft.activeTab][action.id]
        if (!cell || !action.input || cell.status === 'running') return
        console.log('running', action.input)

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
      case 'focus': {
        draft.focus = action.id
        break
      }
      case 'focus-next': {
        const keys = Object.keys(draft.tabs[draft.activeTab])
        const index = keys.findIndex(id => id === draft.focus)
        let newIndex
        if (index >= keys.length - 1) {
          newIndex = keys[0]
        } else {
          newIndex = keys[index + 1]
        }
        draft.focus = newIndex
        break
      }
      case 'focus-previous': {
        const keys = Object.keys(draft.tabs[draft.activeTab])
        const index = keys.findIndex(id => id === draft.focus)
        let newIndex
        if (index <= 0) {
          newIndex = keys[keys.length - 1]
        } else {
          newIndex = keys[index - 1]
        }
        draft.focus = newIndex
        break
      }
    }
  })
}

// @ts-ignore
const useStore: UseStore<
  State & { dispatch: (action: Action) => void }
> = create(devtools(redux(reducer, initialState)))

export default useStore
