import { RunCell, FrontendMessage, Suggestion } from '../electron/shared'

declare function api(command: string): unknown

declare function getSuggestions(value: string, currentDir: string): Suggestion[]

declare function runCell(
  props: RunCell,
  serverMessage: (...args: any[]) => void,
): any // external fn (sender) is returned

declare function frontendMessage(external: any, props: FrontendMessage)

export { api, getSuggestions, runCell, frontendMessage }
