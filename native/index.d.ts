declare function api(command: string): unknown

declare function autocomplete(value: string, currentDir: string): any

declare function runCell(
  props: any,
  serverMessage: (...args: any[]) => void,
): any // external fn (sender) is returned

declare function frontendMessage(external: any, props: any)

export { api, getSuggestions, runCell, frontendMessage }
