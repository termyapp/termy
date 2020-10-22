export type Message =
  | {
      type: 'GET_SUGGESTIONS'
      data: { input: string; currentDir: string }
    }
  | {
      type: 'NEW_COMMAND'
      data: { id: string; input: string; currentDir: string }
    }

export type Suggestion = {
  raw: string
}

export interface Payload {
  id: string
  chunk: Uint8Array
}
