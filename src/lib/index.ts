import { useEffect } from 'react'
import { Payload } from '../../types'
import { CurrentDirStat } from '../interfaces'
import { ipcRenderer } from './ipc'

export const useListener = (
  id: string,
  handler: (payload: Payload) => void,
  deps = [],
) => {
  useEffect(() => {
    // receive events from shell.rs
    ipcRenderer.on('event', (event: any, payload: Payload) => {
      console.log('received event: ', payload)
      if (payload.id === id) {
        handler(payload)
      }
    }) // eslint-disable-next-line
  }, [id, handler, ...deps])
}

export const getCurrentDir = (currentDir: string) => {
  const path = currentDir.split('/')
  if (path.length < 3) {
    return currentDir
  }
  const relativePath = currentDir.split('/').slice(3).join('/')
  return (relativePath.length > 0 ? '~/' : '~') + relativePath
}

// below ones do not work
export const readFile = (path: string): string | null => {
  return null
}

export const writeFile = (path: string, content: string) => {}

export const getLanguage = (path: string): string | undefined => {
  return undefined
}

export const getCommands = (): string[] => {
  return []
}

export const getCurrentDirStat = (currentDir: string): CurrentDirStat => {
  return {} as CurrentDirStat
}

export const getParsedManPage = (cmd: string): any[] => {
  return []
}

// export const isDev = process.env.NODE_ENV === 'development'
export const isDev = true
