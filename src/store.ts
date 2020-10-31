import path from 'path'
import { v4 } from 'uuid'
import create from 'zustand'
import { combine } from 'zustand/middleware'
import { FrontendMessage } from '../types'
import { CellType } from './../types'
import { api, ipc } from './lib'

const useStore = create(
  combine(
    {
      cells: [getDefaultCell()] as CellType[],
    },
    (set, get) => ({
      clear: () => set({ cells: [getDefaultCell()] }),
      new: () => {
        // todo: position as arg (top, bottom, left, right)
        return set({ cells: [...get().cells, getDefaultCell()] })
      },
      run: (id: string) => {
        const cell = get().cells.find(c => c.id === id)
        if (!cell) return

        const message: FrontendMessage = { type: 'run-cell', data: cell }
        ipc.send('message', message)
      },
      setInput: (id: string, input: string) => {
        set(state => ({
          cells: state.cells.map(cell => {
            if (cell.id !== id) {
              return cell
            }

            return { ...cell, input }
          }),
        }))
      },
      setCurrentDir: (id: string, newDir: string) => {
        set(state => ({
          cells: state.cells.map(cell => {
            if (cell.id !== id) {
              return cell
            }

            return { ...cell, currentDir: newDir }
          }),
        }))
      },
      // remove
      // changePosition
    }),
  ),
)

export default useStore

function getDefaultCell(): CellType {
  return {
    id: v4(),
    currentDir: api('home'),
    input: '',
  }
}
