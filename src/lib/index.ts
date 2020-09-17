import { useEffect, useState } from 'react'
import { CurrentDirStat, Payload } from '../interfaces'
import { listen } from './tauri'

export const useListener = (id: string) => {
  const [events, setEvents] = useState<Payload[]>([])

  useEffect(() => {
    listen('event', event => {
      const payload = event.payload as Payload
      if (payload.id === id) {
        setEvents([...events, payload])
      }
    })
  }, [id, events, setEvents])

  return events
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

export const isDev = process.env.NODE_ENV === 'development'
