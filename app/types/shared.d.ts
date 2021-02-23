export interface RunCell {
  id: string
  value: string
  currentDir: string
}

export interface XtermSize {
  rows: number
  cols: number
}

export interface FrontendMessage {
  id: string
  action: 'resume' | 'kill' | { write: string } | { resize: XtermSize }
}

export type Message =
  | { type: 'api'; command: string } // todo: create types for the api
  | ({ type: 'run-cell' } & RunCell)
  | ({ type: 'frontend-message' } & FrontendMessage)
  | { type: 'tldr'; command: string }
  | { type: 'write'; path: string; value: string }

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

export interface Suggestion {
  label: string
  kind: SuggestionKind
  insertText?: string // defaults to label if not defined
  documentation?: string
}

export interface NativeSuggestion extends Suggestion {
  score: number
  date?: string
}

export type SuggestionKind =
  | 'file'
  | 'directory'
  | 'executable'
  | 'externalHistory'

export type WindowMessage = 'minimize' | 'maximize' | 'unmaximize' | 'close'
