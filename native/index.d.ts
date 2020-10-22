import { Suggestion } from '../types'

declare function getSuggestions(input: string, currentDir: string): Suggestion[]

type sendChunk = (chunk: number[]) => void

declare function newCommand(
  id: string,
  input: string,
  currentDir: string,
  sendChunk: sendChunk,
): void

declare function sendStdin(id: string, stdin: string): void

export { getSuggestions, newCommand, sendStdin }
