declare function api(command: string): unknown

declare function getSuggestions(value: string, currentDir: string): Promise<any>

declare function runCell(
  props: any,
  serverMessage: (...args: any[]) => void,
): any // external fn (sender) is returned

declare function frontendMessage(external: any, props: any)

export { api, getSuggestions, runCell, frontendMessage }
