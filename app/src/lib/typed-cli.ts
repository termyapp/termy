import type { Suggestion, SuggestionKind } from 'types'

interface Command {
  name: string
  documentation: string
  kind?: SuggestionKind
  subCommands?: Command[]
}

const theme = {
  name: 'theme',
  documentation: "Change Termy's theme",
  subCommands: [
    { name: '#fff', documentation: '🌞 Light theme' },
    { name: '#000', documentation: '🌚 Dark theme' },
  ],
}

const typedCli: { [key: string]: Command } = {
  theme,
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

export const getTypedCliSuggestions = (input: string): Suggestion[] => {
  const tokens = input.split(' ')

  if (tokens.length === 1) {
    return getSuggestionsFromCommands(Object.values(typedCli))
  } else if (typedCli[tokens[0]] && typedCli[tokens[0]].subCommands) {
    // @ts-ignore
    return getSuggestionsFromCommands(typedCli[tokens[0]].subCommands)
  }

  return []
}
