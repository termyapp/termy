import { RunCell, FrontendMessage, Suggestion } from '../shared'

declare function api(command: string): any

declare function getSuggestions(input: string, currentDir: string): Suggestion[]

declare function runCell(
  props: RunCell,
  serverMessage: (...args: any[]) => void,
): any // external fn (sender) is returned

declare function frontendMessage(external: any, props: FrontendMessage)

export { api, getSuggestions, runCell, frontendMessage }
