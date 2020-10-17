export type Message =
  | {
      type: 'GET_SUGGESTIONS'
      data: { input: string; currentDir: string }
    }
  | { type: 'PROCESS'; data: { id: string } }

export type Suggestion = {
  raw: string
}
