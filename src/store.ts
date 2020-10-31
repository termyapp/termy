import path from 'path'
import { v4 } from 'uuid'
import create from 'zustand'
import { combine } from 'zustand/middleware'
import { FrontendMessage } from '../types'
import { CellType } from './../types'
import { api, sendSync } from './lib'

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

        const builtIn = isBuiltInCommand(cell.input)

        if (builtIn) {
          // handle built-in commands in frontend

          handleBuiltInCommands(cell)
        } else {
          // handle rest server-side

          const message: FrontendMessage = { type: 'run-cell', data: cell }
          sendSync('message', message)
        }
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

const CUSTOM_COMMANDS = ['cd']

function isBuiltInCommand(input: string) {
  return CUSTOM_COMMANDS.includes(input.split(' ')[0])
}

function handleBuiltInCommands(cell: CellType) {
  const command = cell.input.split(' ')[0]
  switch (command) {
    case 'cd': {
      // maybe this shouldn't be a built-in command
      // should work with the new api
      const newDir = path.resolve(cell.currentDir, cell.input.split(' ')[1])

      // set(() => ({
      //   currentDir: newDir,
      // }))
    }
  }
}
