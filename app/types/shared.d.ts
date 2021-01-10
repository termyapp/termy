// In sync with ../electron/shared.d.ts
// todo: figure out a way to reference the types

export type RunCell = {
  id: string
  input: string
  currentDir: string
}

export type XtermSize = {
  rows: number
  cols: number
}

export type FrontendMessage = {
  id: string
  stdin?: string
  size?: XtermSize
}

export type Message =
  | { type: 'api'; command: string } // todo: create types for the api
  | ({ type: 'run-cell' } & RunCell)
  | ({ type: 'frontend-message' } & FrontendMessage)

export interface ServerMessage {
  id: string
  action?: [ActionKeys, string][]
  text?: number[]
  mdx?: string
  api?: string
  status?: Status
  error?: string
}

export type ActionKeys = 'cd' | 'theme'

export type Suggestion = {
  fullCommand?: string
  command: string
  score: number
  indexes: bigint[] // fuzzy indexes to be highlighted
  kind: 'executable' | 'directory' | 'externalHistory'
  date?: string
  tldrDocumentation?: string // md
}
