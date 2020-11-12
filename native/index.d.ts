import { RunCellProps, SendMessageProps } from './../types'
import { Suggestion } from '../types'

declare function api(command: string): any

declare function getSuggestions(input: string, currentDir: string): Suggestion[]

declare function runCell(
  props: RunCellProps,
  serverMessage: (...args: any[]) => void,
): any // external fn (sender) is returned

declare function sendMessage(external: any, props: SendMessageProps)

export { api, getSuggestions, runCell, sendMessage }
