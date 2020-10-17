import { Suggestion } from '../types'

declare function getSuggestions(input: string, currentDir: string): Suggestion[]

export { getSuggestions }
