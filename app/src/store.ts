import produce from 'immer'
import { v4 } from 'uuid'
import create, { UseStore } from 'zustand'
import { devtools, redux } from 'zustand/middleware'
import type { CellType, Message, ThemeMode } from '../types'
import { api, getTheme, ipc, isDev } from './utils'

type State = typeof initialState

// todo: https://artsy.github.io/blog/2018/11/21/conditional-types-in-typescript/
type Action =
  | { type: 'clear' }
  | { type: 'new' }
  | { type: 'remove'; id: string }
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
  return {
    cells: {
      [cell.id]: cell,
    },
    theme: getTheme(isDev ? '#fff' : '#000'), // todo: refactor theme and fix circular dependency error
    focus: cell.id,
  }
})()

const reducer = (state: State, action: Action) => {
  return produce(state, draft => {
    switch (action.type) {
      case 'clear': {
        draft.cells = initialState.cells
        break
      }
      case 'new': {
        const cell = getDefaultCell()
        draft.cells[cell.id] = cell
        draft.focus = cell.id
        break
      }
      case 'remove': {
        const keys = Object.keys(draft.cells)
        if (keys.length <= 1) break
        // todo: kill pty if running
        delete draft.cells[action.id]

        // focus prev
        const index = keys.findIndex(id => id === draft.focus)
        if (index <= 0) {
          draft.focus = keys[keys.length - 1]
        } else {
          draft.focus = keys[index - 1]
        }
        break
      }
      case 'set-cell': {
        draft.cells[action.id] = { ...draft.cells[action.id], ...action.cell }
        break
      }
      case 'run-cell': {
        const cell = draft.cells[action.id]
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
        const keys = Object.keys(draft.cells)
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
        const keys = Object.keys(draft.cells)
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
