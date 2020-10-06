import { DependencyList, useEffect } from 'react'
import { CurrentDirStat, Payload } from '../interfaces'
import { listen } from './tauri'

export const useListener = (
  id: string,
  handler: (payload: Payload) => void,
  deps?: DependencyList,
) => {
  useEffect(() => {
    // receive events from shell.rs
    listen('event', (event: any) => {
      const rawPayload = event.payload as { id: string; chunk: number[] }
      if (rawPayload.id === id) {
        const payload: Payload = {
          id: rawPayload.id,
          chunk: Uint8Array.from(rawPayload.chunk),
        }
        handler(payload)
      }
    }) // @ts-ignore
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
