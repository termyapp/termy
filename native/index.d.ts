import { Suggestion } from '../types'

declare function api(command: string): any

declare function getSuggestions(input: string, currentDir: string): Suggestion[]

declare function runCell(
  id: string,
  input: string,
  currentDir: string,
  sendStdout: (chunk: number[]) => void,
  sendExitStatus: (...args: any[]) => void,
): External

declare function sendStdin(external: any, key: string): void

export { api, getSuggestions, runCell, sendStdin }
