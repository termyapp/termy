import type { ThemeMode } from '../../types'
import { darkTheme, lightTheme } from '../themes'

export const isDev = import.meta.env.SNOWPACK_PUBLIC_NODE_ENV === 'development'

export const formatCurrentDir = (currentDir: string) => {
  const path = currentDir.split('/')
  if (path.length < 3) {
    return currentDir
  }
  const relativePath = currentDir.split('/').slice(3).join('/')
  return (relativePath.length > 0 ? '~/' : '~') + relativePath
}

export const getTheme = (mode?: ThemeMode) =>
  mode === '#000' ? darkTheme : lightTheme

export const shortenDate = (date: string) =>
  date
    .replace('seconds', 's')
    .replace('minutes', 'min')
    .replace('hours', 'h')
    .replace('days', 's')
    .replace('months', 'm')
    .replace('years', 'y')

export * from './ipc'
export * from './listener'
export * from './xterm'

// todo: replace below ones w/ api
export const readFile = (path: string): string | null => {
  return null
}

export const writeFile = (path: string, content: string) => {}

export const getLanguage = (path: string): string | undefined => {
  return undefined
}
