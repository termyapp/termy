export interface SearchResult {
  path: string
  name: string
  icon?: string
}

declare function findApplication(query: string): SearchResult[]

declare function findFile(query: string, dirs: string[]): SearchResult[]

export { findApplication, findFile }
