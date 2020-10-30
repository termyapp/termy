import { Suggestion } from '../types'

declare function getSuggestions(input: string, currentDir: string): Suggestion[]

type External = any

declare function newCommand(
  id: string,
  input: string,
  currentDir: string,
  sendStdout: (chunk: number[]) => void,
  sendExitStatus: (exitStatus: number) => void,
): External

declare function sendStdin(external: External, key: string): void

export { getSuggestions, newCommand, sendStdin }
