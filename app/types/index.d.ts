export type Status = 'running' | 'success' | 'error' | null

export type OutputType = 'text' | 'mdx' | null

export type ThemeMode = '#fff' | '#000'

export interface Cell {
  id: string
  value: string
  currentDir: string
  type: OutputType
  status: Status
}

export interface CellWithActive extends Cell {
  active: boolean
}

export * from './shared'
