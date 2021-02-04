import { loader } from '@monaco-editor/react'
import type { NativeSuggestion, Suggestion, SuggestionKind } from '@types'
import { formatDistanceToNow } from 'date-fns'
import type * as Monaco from 'monaco-editor'
import { TERMY } from '../terminal/prompt/input'
import { getTypedCliSuggestions, ipc } from './'

export const loadMonaco = () => {
  loader.config({ paths: { vs: 'monaco-editor' } })
  loader.init().then(monaco => {
    const toMonacoKind = (kind: SuggestionKind) => {
      // info: https://user-images.githubusercontent.com/35271042/96901834-9bdbb480-1448-11eb-906a-4a80f5f14921.png
      const completionItemKind = monaco.languages.CompletionItemKind
      switch (kind) {
        case 'executable':
          return completionItemKind.Event
        case 'directory':
          return completionItemKind.Folder
        case 'externalHistory':
          return completionItemKind.Enum
        default:
          return completionItemKind.Text
      }
    }

    const suggestionToCompletionItem = (
      suggestion: Suggestion | NativeSuggestion,
    ): Monaco.languages.CompletionItem => {
      let documentation = suggestion.documentation
      let label: unknown = suggestion.label

      const tldr = ipc.sendSync('message', {
        type: 'tldr',
        command: suggestion.label,
      })
      if (tldr) {
        documentation =
          tldr + '\n*Source:* [📚tldr](https://github.com/tldr-pages/tldr)'
      }

      if ('date' in suggestion && suggestion.date) {
        label = {
          name: label,
          qualifier: `Modified ${formatDistanceToNow(
            parseInt(suggestion.date),
          )} ago`,
        }
      }

      return {
        label,
        insertText: suggestion.insertText
          ? suggestion.insertText
          : suggestion.label,
        kind: toMonacoKind(suggestion.kind),
        documentation: documentation ? { value: documentation } : undefined,
      } as Monaco.languages.CompletionItem
    }

    monaco.languages.registerCompletionItemProvider(TERMY, {
      triggerCharacters: [' ', '/'],
      provideCompletionItems: async (
        model: Monaco.editor.ITextModel,
        position: Monaco.Position,
        context: Monaco.languages.CompletionContext,
        token: Monaco.CancellationToken,
      ) => {
        const value = model.getValue()
        const cellId = model.uri.authority
        const cell = document.getElementById(cellId) as HTMLDivElement

        if (!cell) return { incomplete: false, suggestions: [] }
        // todo: get fresh state outside of component
        // https://github.com/pmndrs/zustand#readingwriting-state-and-reacting-to-changes-outside-of-components
        const currentDir = cell.dataset.cd

        const rawSuggestions: NativeSuggestion[] = await ipc.invoke(
          'suggestions',
          value,
          currentDir,
        )
        const suggestions: Monaco.languages.CompletionItem[] = rawSuggestions.map(
          suggestionToCompletionItem,
        )

        return { incomplete: false, suggestions }
      },
    })

    monaco.languages.registerCompletionItemProvider(TERMY, {
      triggerCharacters: [' '],
      provideCompletionItems: async (
        model: Monaco.editor.ITextModel,
        position: Monaco.Position,
        context: Monaco.languages.CompletionContext,
        token: Monaco.CancellationToken,
      ) => {
        const input = model.getValue()

        const suggestions = getTypedCliSuggestions(input).map(
          suggestionToCompletionItem,
        )

        return { incomplete: false, suggestions }
      },
    })
  })
}

export const getThemeData = (theme: any) => ({
  base: theme.colors.base as Monaco.editor.BuiltinTheme,
  inherit: true,
  rules: [],

  colors: {
    // Monaco doesn't allow instances to have different themes
    // We use one and set the background to transparent to make it blend in
    'editor.background': theme.colors.$background,
    'editor.foreground': theme.colors.$foreground,
    'editor.lineHighlightBackground': theme.colors.$background,
    'editorSuggestWidget.background': theme.colors.$background,
    'editor.selectionBackground': theme.colors.$selection,
    'editor.selectionHighlightBackground': theme.colors.$background,
    'editorCursor.foreground': theme.colors.$caret,
  },
})
