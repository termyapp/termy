import type { Suggestion, SuggestionKind } from 'types'

interface Command {
  name: string
  documentation: string
  kind?: SuggestionKind
  subCommands?: Command[]
}

const theme: Command = {
  name: 'theme',
  documentation: "Changes Termy's theme",
  subCommands: [
    { name: '#fff', documentation: '🌞 Light theme' },
    { name: '#000', documentation: '🌚 Dark theme' },
  ],
}

const shortcuts: Command = {
  name: 'shortcuts',
  documentation: "Lists Termy's shortcuts",
}

const home: Command = {
  name: 'home',
  documentation: 'Returns your `HOME` directory',
}

const view: Command = {
  name: 'view',
  documentation: `
# View

View files and folders

### Example usage

\`view package.json\`
`,
}

const typedCli: { [key: string]: Command } = {
  theme,
  shortcuts,
  home,
  view,
}

const getSuggestionsFromCommands = (commands: Command[]): Suggestion[] => {
  return commands.map(({ name, kind, documentation }) => {
    return {
      label: name,
      insertText: name,
      kind,
      documentation,
    } as Suggestion
  })
}

// cool parser: https://github.com/substack/node-shell-quote/blob/master/index.js
export const getTypedCliSuggestions = (value: string): Suggestion[] => {
  const tokens = value.split(' ')

  if (tokens.length === 1) {
    return getSuggestionsFromCommands(Object.values(typedCli))
  } else if (typedCli[tokens[0]] && typedCli[tokens[0]].subCommands) {
    // @ts-ignore
    return getSuggestionsFromCommands(typedCli[tokens[0]].subCommands)
  }

  return []
}
