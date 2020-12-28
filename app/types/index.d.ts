import type { Node } from 'slate'

export type Status = 'running' | 'success' | 'error' | null

export type OutputType = 'text' | 'mdx' | null

export type ThemeMode = '#fff' | '#000'

export type CellType = {
  id: string
  value: Node[]
  currentDir: string
  type: OutputType
  status: Status
  focused: boolean
}

// not using these rn
export type FileEntry = {
  fileName: string
  path: string
  isDir: boolean
  isFile: boolean
}

export type CurrentDirStat = FileEntry & {
  gitBranch?: string
}

export type ViewType = 'img' | 'dir' | 'text' | 'else'

export type ViewCommand = {
  viewType: ViewType
  path: string
  content: string
} | null

export * from './shared'
