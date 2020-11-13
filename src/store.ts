import produce from 'immer'
import { v4 } from 'uuid'
import create, { UseStore } from 'zustand'
import { devtools, redux } from 'zustand/middleware'
import { Message, ThemeMode } from '../types'
import { CellType } from './../types'
import { api, getTheme, ipc } from './lib'

type State = typeof initialState

// todo: https://artsy.github.io/blog/2018/11/21/conditional-types-in-typescript/
type Action =
  | { type: 'clear' }
  | { type: 'new' }
  | { type: 'set-cell'; id: string; cell: Partial<CellType> }
  | { type: 'run-cell'; id: string; input: string }
  | { type: 'focus'; id: string | null }
  | { type: 'focus-up' }
  | { type: 'focus-down' }

const getDefaultCell = (): CellType => {
  return {
    id: v4(),
    currentDir: api('home'),
    value: [
      {
        type: 'paragraph',
        children: [{ text: '' }],
      },
    ],
    type: null,
  }
}

const initialState = (() => {
  // todo: init cell input with `help` or `guide` on first launch
  const cell = getDefaultCell()

  return {
    cells: [cell],
    focused: cell.id as string | null,
    theme: getTheme(),
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
        const newCell = getDefaultCell()
        draft.cells.push(newCell)
        draft.focused = newCell.id
        break
      }
      case 'set-cell': {
        const index = draft.cells.findIndex(c => c.id === action.id)
        if (typeof index !== 'number') return

        draft.cells[index] = { ...draft.cells[index], ...action.cell }
        break
      }
      case 'run-cell': {
        const cell = draft.cells.find(c => c.id === action.id)
        if (!cell || !action.input) return
        console.log('running', action.input)

        // reset
        cell.type = null

        // todo: move this to cell
        const command = action.input.split(' ')[0]
        if (command === 'theme') {
          draft.theme = getTheme(action.input.split(' ')[1] as ThemeMode)
          break
        }

        const message: Message = {
          type: 'run-cell',
          id: cell.id,
          input: action.input,
          currentDir: cell.currentDir,
        }

        ipc.send('message', message)
        break
      }
      case 'focus': {
        draft.focused = action.id
        if (typeof action.id == 'string') {
          const el = document.getElementById(action.id)
          if (el) el.scrollIntoView()
        }
        break
      }
      case 'focus-up': {
        const index = draft.cells.findIndex(c => c.id === draft.focused)
        if (typeof index !== 'number') return

        if (index < 1) {
          draft.focused = draft.cells[draft.cells.length - 1].id
        } else {
          draft.focused = draft.cells[index - 1].id
        }

        break
      }
      case 'focus-down': {
        const index = draft.cells.findIndex(c => c.id === draft.focused)
        if (typeof index !== 'number') return

        if (index > draft.cells.length - 2) {
          draft.focused = draft.cells[0].id
        } else {
          draft.focused = draft.cells[index + 1].id
        }

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
