import type { Status, ThemeMode } from '../../types'
import { darkTheme, lightTheme } from '../themes'

export const isDev = import.meta.env.MODE === 'development'

export const getTheme = (mode?: ThemeMode) =>
  mode === '#000' ? darkTheme : lightTheme

export const isMac = /Mac/.test(navigator.userAgent)

export const formatCurrentDir = (currentDir: string) => {
  const path = currentDir.split('/')
  if (path.length < 3) {
    return currentDir
  }
  const relativePath = currentDir.split('/').slice(3).join('/')
  return (relativePath.length > 0 ? '~/' : '~') + relativePath
}

export const focusCell = (id: string, status: Status) => {
  id = status === 'running' ? `output-${id}` : `input-${id}`
  document.getElementById(id)?.focus()
}

export * from './ipc'
export * from './monaco'
export * from './typed-cli'
