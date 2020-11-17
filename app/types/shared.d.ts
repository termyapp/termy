// In sync with ../electron/shared.d.ts
// todo: figure out a way to reference the types

export type Status = 'running' | 'success' | 'error' | null

export type OutputType = 'pty' | 'api' | null

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
  | {
      type: 'get-suggestions'
      input: string
      currentDir: string
    }
  | ({ type: 'run-cell' } & RunCell)
  | ({ type: 'frontend-message' } & FrontendMessage)

export type ServerMessage = {
  id: string
  output?:
    | { type: 'pty'; data: { ptyData: number[] } }
    | { type: 'api'; data: { apiData: string }; cd?: string }
  status?: Status
}
