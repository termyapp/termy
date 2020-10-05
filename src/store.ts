import path from 'path'
import { emit } from './lib/tauri'
import create from 'zustand'
import { combine } from 'zustand/middleware'
import { Command } from './interfaces'
import getCommandType from './lib/get-command-type'

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
          emit(
            'event',
            JSON.stringify({
              ...command,
              eventType: 'NEW_COMMAND',
            }),
          )
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
