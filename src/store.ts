import { devtools, redux } from 'zustand/middleware'
import produce from 'immer'
import { v4 } from 'uuid'
import create, { UseStore } from 'zustand'
import { FrontendMessage } from '../types'
import { CellType } from './../types'
import { api, ipc } from './lib'

type State = typeof initialState

type Action =
  | { type: 'clear' }
  | { type: 'new' }
  | { type: 'run'; id: string }
  | { type: 'set-input'; id: string; input: string }
  | { type: 'set-current-dir'; id: string; newDir: string }

const getDefaultCell = (): CellType => {
  return {
    id: v4(),
    currentDir: api('home'),
    input: '',
  }
}

const initialState = (() => {
  const cell = getDefaultCell()
  return { cells: { [cell.id]: cell } }
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
        draft.cells[newCell.id] = newCell
        break
      }
      case 'run': {
        const message: FrontendMessage = {
          type: 'run-cell',
          data: draft.cells[action.id],
        }
        ipc.send('message', message)
        break
      }
      case 'set-input': {
        draft.cells[action.id].input = action.input
        break
      }
      case 'set-current-dir': {
        draft.cells[action.id].currentDir = action.newDir
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
