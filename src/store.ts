import path from 'path'
import create from 'zustand'
import { combine } from 'zustand/middleware'
import { Message } from '../types'
import { Command } from './interfaces'
import getCommandType from './lib/get-command-type'
import { ipcRenderer } from './lib/ipc'

const DEFAULT_PATH = '/Users/martonlanga'

const useStore = create(
  combine(
    {
      history: [
        {
          id: '123',
          input: 'ls',
          currentDir: '/Users/martonlanga/code/termy/demo',
        },
      ] as Command[],
      currentDir: DEFAULT_PATH,
    },
    (set, get) => ({
      clear: () => set({ history: [] }),
      setCurrentDir: (newDir: string) =>
        set({ currentDir: path.resolve(get().currentDir, newDir) }),
      add: (command: Command) => {
        // handle stuff here that should have side effects an be only run once (we only invoke each process one time by sending only one wvent)
        const commandType = getCommandType(command.input)
        if (commandType === 'default') {
          // send event
          const message: Message = { type: 'NEW_COMMAND', data: command }
          console.log(ipcRenderer.sendSync('message', message))
        } else if (commandType === 'custom') {
          if ('cd' === command.input.split(' ')[0]) {
            const newDir = path.resolve(
              command.currentDir,
              command.input.split(' ')[1],
            )

            set(() => ({
              currentDir: newDir,
            }))
          }
        }

        return set({
          history: [...get().history, command],
        })
      },
    }),
  ),
)

export default useStore
