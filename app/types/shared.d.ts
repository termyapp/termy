import type { Status } from './index'

// ----------------------------------------------------------------
// App Messages
// ----------------------------------------------------------------

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
  | ({ type: 'api' } & RunCell) // todo: create types for the api
  | { type: 'get-suggestions'; value: string; currentDir: string }
  | ({ type: 'run-cell' } & RunCell)
  | ({ type: 'frontend-message' } & FrontendMessage)
  | { type: 'write'; path: string; value: string }
  | { type: 'get-window-info' }
  | { type: 'window-action'; action: WindowAction }

// ----------------------------------------------------------------
// Native Messages
// ----------------------------------------------------------------

export type NativeMessage =
  | { action: Action }
  | { status: Status }
  | { tui: number[] }
  | { component: Component }

export type Component =
  | { type: 'edit'; props: { path: string; value: string; language: string } }
  | { type: 'table'; props: { json: string } }
  | { type: 'path'; props: { children: string } }
  | { type: 'markdown'; props: { children: string } }
// todo: | { type: 'error'; message: string }

export type Action = { cd: string } | { theme: string }

// ----------------------------------------------------------------
// Suggestions
// ----------------------------------------------------------------

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
  | 'history'
  | 'externalHistory'

// ----------------------------------------------------------------
// Window
// ----------------------------------------------------------------

export type WindowAction = 'minimize' | 'maximize' | 'unmaximize' | 'close'

export interface WindowInfo {
  isMaximized: boolean
}
