import { sendSync } from './ipc'

export const formatCurrentDir = (currentDir: string) => {
  const path = currentDir.split('/')
  if (path.length < 3) {
    return currentDir
  }
  const relativePath = currentDir.split('/').slice(3).join('/')
  return (relativePath.length > 0 ? '~/' : '~') + relativePath
}

export const api = (command: string) => {
  return sendSync('message', { type: 'api', command })
}

// todo: replace below ones w/ api
export const readFile = (path: string): string | null => {
  return null
}

export const writeFile = (path: string, content: string) => {}

export const getLanguage = (path: string): string | undefined => {
  return undefined
}

// export const isDev = process.env.NODE_ENV === 'development'
export const isDev = true

export * from './ipc'
export * from './listener'
