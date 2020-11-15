import produce from 'immer'
import { v4 } from 'uuid'
import create, { UseStore } from 'zustand'
import { devtools, redux } from 'zustand/middleware'
import type { Message, ThemeMode } from '../types'
import type { CellType } from '../types'
import { api, getTheme, ipc, isDev } from './lib'

type State = typeof initialState

// todo: https://artsy.github.io/blog/2018/11/21/conditional-types-in-typescript/
type Action =
  | { type: 'clear' }
  | { type: 'new' }
  | { type: 'set-cell'; id: string; cell: Partial<CellType> }
  | { type: 'run-cell'; id: string; input: string }
  | { type: 'set-layouts'; layouts: ReactGridLayout.Layouts }
  | { type: 'focus-up' }
  | { type: 'focus-down' }

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
  }
}

// todo: init cell input with `help` or `guide` on first launch
const initialState = (() => {
  const cell = getDefaultCell()
  return {
    cells: { [cell.id]: cell },
    theme: getTheme(isDev ? '#fff' : '#000'), // todo: refactor theme and fix circular dependency error
    layouts: {
      lg: [{ i: cell.id, x: 0, y: 0, w: 10, h: 6 }],
    } as ReactGridLayout.Layouts,
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
      case 'set-cell': {
        draft.cells[action.id] = { ...draft.cells[action.id], ...action.cell }
        break
      }
      case 'run-cell': {
        const cell = draft.cells[action.id]
        if (!cell || !action.input) return
        console.log('running', action.input)

        // reset
        cell.status = undefined

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
      case 'set-layouts': {
        draft.layouts = action.layouts
        break
      }
      // case 'focus-up': {
      //   const index = draft.cells.findIndex(c => c.id === draft.focused)
      //   if (typeof index !== 'number') return

      //   const el = document.getElementById(
      //     index < 1
      //       ? draft.cells[draft.cells.length - 1].id
      //       : draft.cells[index - 1].id,
      //   )
      //   if (el) el.focus()

      //   break
      // }
      // case 'focus-down': {
      //   const index = draft.cells.findIndex(c => c.id === draft.focused)
      //   if (typeof index !== 'number') return

      //   const el = document.getElementById(
      //     index > draft.cells.length - 2
      //       ? draft.cells[0].id
      //       : draft.cells[index + 1].id,
      //   )
      //   if (el) el.focus()

      //   break
      // }
    }
  })
}

// @ts-ignore
const useStore: UseStore<
  State & { dispatch: (action: Action) => void }
> = create(devtools(redux(reducer, initialState)))

export default useStore
