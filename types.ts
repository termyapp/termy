import { Node } from 'slate'

type Status = 'running' | 'success' | 'error'

export type OutputType = 'pty' | 'api' | null

export type ThemeMode = '#fff' | '#000'

export type XtermSize = {
  row: number
  column: number
}

export type CellType = {
  id: string
  value: Node[]
  currentDir: string
  status?: Status // undefined is default (before running anything)

  // position?: number[] // todo: (row, col maybe?)
}

export type CellTypeWithFocused = CellType & { focused: boolean }

export type RunCellProps = {
  id: string
  input: string
  currentDir: string
}

export type SendMessageProps = {
  id: string
  stdin?: string
  size?: XtermSize
}

export type Message =
  | { type: 'api'; command: string } // todo: create types for the api
  | {
      type: 'get-suggestions'
      input: string
      currentDir: string
    }
  | ({ type: 'run-cell' } & RunCellProps)
  | ({ type: 'send-message' } & SendMessageProps)

export type ServerMessage = {
  id: string
  output?: { data: string; type: OutputType; cd?: string }
  status?: Status
}

export type Suggestion = {
  score: number
  command: string
  display: string
  suggestionType: 'dir' | 'historyExternal'
  date?: string
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
