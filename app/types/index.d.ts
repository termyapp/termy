export type Status = 'running' | 'success' | 'error' | null

export type OutputType = 'text' | 'mdx' | null

export type ThemeMode = '#fff' | '#000'

export interface ICell {
  id: string
  value: string
  currentDir: string
  type: OutputType
  status: Status
}

export interface ICellWithActive extends ICell {
  active: boolean
}

export * from './shared'
