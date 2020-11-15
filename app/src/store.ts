import produce from 'immer'
import { v4 } from 'uuid'
import create, { UseStore } from 'zustand'
import { devtools, redux } from 'zustand/middleware'
import type { CellType, Message, ThemeMode } from '../types'
import { api, getTheme, ipc, isDev } from './lib'

type State = typeof initialState

// todo: https://artsy.github.io/blog/2018/11/21/conditional-types-in-typescript/
type Action =
  | { type: 'clear' }
  | { type: 'new' }
  | { type: 'remove'; id: string }
  | { type: 'set-cell'; id: string; cell: Partial<CellType> }
  | { type: 'run-cell'; id: string; input: string }

const getDefaultCell = (): CellType => {
  const id = v4()
  return {
    id,
    currentDir: api('home'),
    value: [
      {
        type: 'paragraph',
        children: [{ text: '' }],
      },
    ],
    type: null,
    status: null,
  }
}

// todo: init cell input with `help` or `guide` on first launch
const initialState = (() => {
  const cellA1 = getDefaultCell()
  const cellB1 = getDefaultCell()
  const cellB2 = getDefaultCell()

  return {
    cells: { [cellA1.id]: cellA1, [cellB1.id]: cellB1, [cellB2.id]: cellB2 },
    theme: getTheme(isDev ? '#fff' : '#000'), // todo: refactor theme and fix circular dependency error
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
        break
      }
      case 'remove': {
        delete draft.cells[action.id]
        break
      }
      case 'set-cell': {
        draft.cells[action.id] = { ...draft.cells[action.id], ...action.cell }
        break
      }
      case 'run-cell': {
        const cell = draft.cells[action.id]
        if (!cell || !action.input) return
        console.log('running', action.input)

        // reset
        cell.status = null

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
    }
  })
}

// @ts-ignore
const useStore: UseStore<
  State & { dispatch: (action: Action) => void }
> = create(devtools(redux(reducer, initialState)))

export default useStore
