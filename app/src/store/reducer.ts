import { getTheme, ipc } from '@src/utils'
import type {
  Cell,
  FrontendMessage,
  Message,
  ThemeMode,
  WindowInfo,
} from '@types'
import produce from 'immer'
import { v4 } from 'uuid'
import { getDefaultCell, nextOrLast, nextOrPrevious } from './helpers'
import type { State } from './state'

// todo: https://artsy.github.io/blog/2018/11/21/conditional-types-in-typescript/
export type Action =
  | { type: 'new-cell' }
  | { type: 'new-tab' }
  | { type: 'remove-cell'; id?: string }
  | { type: 'remove-tab'; id?: string }
  | { type: 'set-cell'; id?: string; cell: Partial<Cell> }
  | { type: 'run-cell'; id?: string }
  | { type: 'kill-cell'; id?: string }
  | { type: 'resume-cell'; id?: string }
  | ({ type: 'frontend-message' } & FrontendMessage)
  | { type: 'set-theme'; theme: ThemeMode }
  | { type: 'focus-cell'; id: string | 'next' | 'previous' }
  | { type: 'focus-tab'; id: string | 'next' | 'previous' }
  | { type: 'update-window-info'; info: WindowInfo }

export default function reducer(state: State, action: Action) {
  return produce(state, draft => {
    console.log(action.type.toUpperCase(), action)
    switch (action.type) {
      case 'new-cell': {
        const cell = getDefaultCell()
        const activeTab = draft.tabs[draft.activeTab]

        activeTab.activeCell = cell.id
        activeTab.cells.push(cell.id)
        draft.cells[cell.id] = cell
        break
      }
      case 'new-tab': {
        const tab = v4()
        const cell = getDefaultCell()

        draft.tabs[tab] = { cells: [cell.id], activeCell: cell.id }
        draft.cells[cell.id] = cell
        draft.activeTab = tab
        break
      }
      case 'remove-cell': {
        const id = action.id ?? draft.tabs[draft.activeTab].activeCell
        const tabs = Object.keys(draft.tabs)
        const cells = draft.tabs[draft.activeTab].cells

        if (tabs.length > 1) {
          if (cells.length > 1) {
            // remove cell
            delete draft.cells[id]
            draft.tabs[draft.activeTab].activeCell = nextOrLast(id, cells)
            const index = draft.tabs[draft.activeTab].cells.findIndex(
              cell => cell === id,
            )
            if (index !== -1) draft.tabs[draft.activeTab].cells.splice(index, 1)
          }
          // if it is the last remaining cell in the active tab, remove the tab
          else {
            for (const cell in draft.tabs[draft.activeTab].cells) {
              // clean up cells
              delete draft.cells[cell]
            }
            delete draft.tabs[draft.activeTab]
            draft.activeTab = nextOrLast(draft.activeTab, tabs)
          }
        } else {
          // prevent removing the last remaining cell
          if (cells.length > 1) {
            // same as other remove cell
            delete draft.cells[id]
            draft.tabs[draft.activeTab].activeCell = nextOrLast(id, cells)
            const index = draft.tabs[draft.activeTab].cells.findIndex(
              cell => cell === id,
            )
            if (index !== -1) draft.tabs[draft.activeTab].cells.splice(index, 1)
          }
        }

        break
      }
      case 'remove-tab': {
        const id = action.id ?? draft.activeTab
        const tabs = Object.keys(draft.tabs)

        // prevent removing the last tab
        if (tabs.length > 1) {
          for (const cell in draft.tabs[id].cells) {
            // clean up cells
            delete draft.cells[cell]
          }
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
            draft.tabs[draft.activeTab].cells,
          )
        }

        if (draft.tabs[draft.activeTab].activeCell === id) return

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
        const id = action.id ?? draft.tabs[draft.activeTab].activeCell
        draft.cells[id] = {
          ...draft.cells[id],
          ...action.cell,
        }
        break
      }
      case 'run-cell': {
        const id = action.id ?? draft.tabs[draft.activeTab].activeCell
        const cell = draft.cells[id]
        if (!cell || !cell.value || cell.status === 'running') return

        cell.status = null

        const message: Message = {
          type: 'run-cell',
          id: cell.id,
          value: cell.value,
          currentDir: cell.currentDir,
        }
        ipc.invoke(message)
        break
      }
      case 'kill-cell': {
        const id = action.id ?? draft.tabs[draft.activeTab].activeCell
        ipc.invoke({ type: 'frontend-message', id, action: 'kill' })
        break
      }
      case 'resume-cell': {
        const id = action.id ?? draft.tabs[draft.activeTab].activeCell

        const message: Message = {
          type: 'frontend-message',
          id,
          action: 'resume',
        }
        ipc.invoke(message)
        break
      }
      case 'frontend-message': {
        ipc.invoke(action)
        break
      }
      case 'set-theme': {
        draft.theme = getTheme(action.theme)
        break
      }
    }
  })
}
