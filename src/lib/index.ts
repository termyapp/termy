import { CurrentDirStat } from '../../types'

export const formatCurrentDir = (currentDir: string) => {
  const path = currentDir.split('/')
  if (path.length < 3) {
    return currentDir
  }
  const relativePath = currentDir.split('/').slice(3).join('/')
  return (relativePath.length > 0 ? '~/' : '~') + relativePath
}

// todo: replace below ones w/ api
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
