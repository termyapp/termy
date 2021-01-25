import produce from 'immer'
import { v4 } from 'uuid'
import create, { UseStore } from 'zustand'
import { devtools, redux } from 'zustand/middleware'
import type { CellType, Message, ThemeMode } from '../types'
import { api, getTheme, ipc, isDev } from './utils'

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
    console.log('dispatched', action.type.toUpperCase(), action)
    switch (action.type) {
      case 'new-cell': {
        const cell = getDefaultCell()
        draft.tabs[draft.activeTab][cell.id] = cell
        draft.focus = cell.id
        break
      }
      case 'new-tab': {
        const tab = v4()
        const cell = getDefaultCell()
        draft.tabs[tab] = { [cell.id]: cell }
        draft.focus = cell.id
        draft.activeTab = tab
        break
      }
      case 'remove-cell': {
        const id = action.id || draft.focus
        const tabs = Object.keys(draft.tabs)
        const cells = Object.keys(draft.tabs[draft.activeTab])

        if (tabs.length > 1) {
          if (cells.length > 1) delete draft.tabs[draft.activeTab][id]
          // if it is the last remaining cell in the active tab, remove the tab
          else delete draft.tabs[draft.activeTab]
        } else {
          // prevent removing the last remaining cell
          if (cells.length > 1) delete draft.tabs[draft.activeTab][id]
        }

        // focus prev
        const keys = Object.keys(draft.tabs)
        const index = keys.findIndex(id => id === draft.focus)
        let newIndex
        if (index <= 0) {
          newIndex = keys[keys.length - 1]
        } else {
          newIndex = keys[index - 1]
        }
        draft.activeTab = newIndex
        break
      }
      case 'remove-tab': {
        const id = action.id || draft.focus
        const tabs = Object.keys(draft.tabs)

        if (tabs.length > 1) {
          // prevent removing the last tab
          delete draft.tabs[id]
        }

        // focus prev
        const index = tabs.findIndex(id => id === draft.activeTab)
        let active
        if (index <= 0) {
          active = tabs[tabs.length - 1]
        } else {
          active = tabs[index - 1]
        }

        draft.activeTab = active
        console.log(
          Object.keys(draft.tabs[active])[0],
          Object.keys(draft.tabs[active]),
        )
        draft.focus = Object.keys(draft.tabs[active])[0]
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
      case 'focus-cell': {
        let focus = action.id

        if (action.id === 'next') {
          const keys = Object.keys(draft.tabs[draft.activeTab])
          const index = keys.findIndex(id => id === draft.focus)
          if (index >= keys.length - 1) {
            focus = keys[0]
          } else {
            focus = keys[index + 1]
          }
        } else if (action.id === 'previous') {
          const keys = Object.keys(draft.tabs[draft.activeTab])
          const index = keys.findIndex(id => id === draft.focus)
          if (index <= 0) {
            focus = keys[keys.length - 1]
          } else {
            focus = keys[index - 1]
          }
        }

        draft.focus = focus
        break
      }
      case 'focus-tab': {
        let active = action.id

        if (action.id === 'next') {
          const keys = Object.keys(draft.tabs)
          const index = keys.findIndex(id => id === draft.activeTab)
          if (index >= keys.length - 1) {
            active = keys[0]
          } else {
            active = keys[index + 1]
          }
        } else if (action.id === 'previous') {
          const keys = Object.keys(draft.tabs)
          const index = keys.findIndex(id => id === draft.activeTab)
          if (index <= 0) {
            active = keys[keys.length - 1]
          } else {
            active = keys[index - 1]
          }
        }

        draft.activeTab = active
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
