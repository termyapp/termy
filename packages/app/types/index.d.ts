export type Status = 'running' | 'success' | 'error' | null

export type OutputType = 'tui' | 'gui' | null

export type Themes = 'light' | 'dark'

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
