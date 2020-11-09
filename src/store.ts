import { devtools, redux } from 'zustand/middleware'
import produce from 'immer'
import { v4 } from 'uuid'
import create, { UseStore } from 'zustand'
import { FrontendMessage } from '../types'
import { CellType } from './../types'
import { api, ipc } from './lib'

type State = typeof initialState

// todo: https://artsy.github.io/blog/2018/11/21/conditional-types-in-typescript/
type Action =
  | { type: 'clear' }
  | { type: 'new' }
  | { type: 'set-cell'; id: string; cell: Partial<CellType> }
  | { type: 'run'; id: string }
  | { type: 'focus'; id: string }
  | { type: 'focus-up' }
  | { type: 'focus-down' }

const getDefaultCell = (): CellType => {
  return {
    id: v4(),
    currentDir: api('home'),
    input: '',
  }
}

const initialState = (() => {
  const cell = getDefaultCell()
  const cell2 = getDefaultCell()
  return { cells: [cell, cell2], focused: cell.id }
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
      case 'run': {
        const cell = draft.cells.find(c => c.id === action.id)
        if (!cell) return

        const message: FrontendMessage = {
          type: 'run-cell',
          // electron complains if we include a draft based
          // object with additional properties on it
          data: { id: cell.id, input: cell.input, currentDir: cell.currentDir },
        }
        console.log('running', message.data.input)

        ipc.send('message', message)
        break
      }
      case 'focus': {
        draft.focused = action.id
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
