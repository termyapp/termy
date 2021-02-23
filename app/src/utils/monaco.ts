import { loader } from '@monaco-editor/react'
import useStore from '@src/store'
import type { NativeSuggestion, Suggestion, SuggestionKind } from '@types'
import { formatDistanceToNow } from 'date-fns'
import _ from 'lodash'
import type * as Monaco from 'monaco-editor'
import { TERMY } from '../termy/input'
import { getTypedCliSuggestions, ipc } from './'

export const loadMonaco = () => {
  // loader.config({ paths: { vs: 'monaco-editor' } })
  loader.init().then(monaco => {
    const toMonacoKind = (kind: SuggestionKind) => {
      // info: https://user-images.githubusercontent.com/35271042/96901834-9bdbb480-1448-11eb-906a-4a80f5f14921.png
      const completionItemKind = monaco.languages.CompletionItemKind
      switch (kind) {
        case 'file':
          return completionItemKind.File
        case 'directory':
          return completionItemKind.Folder
        case 'executable':
          return completionItemKind.Event
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

      // todo: move this into resolveCompletionItem (or to native)
      const tldr = ipc.sendSync('message', {
        type: 'tldr',
        command: suggestion.label,
      })
      if (tldr && !documentation) {
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
        const currentDir = useStore.getState().cells[cellId].currentDir

        const rawSuggestions: NativeSuggestion[] = await ipc.invoke(
          'suggestions',
          value,
          currentDir,
        )
        console.log(rawSuggestions)
        let suggestions: Monaco.languages.CompletionItem[] = [
          ...getTypedCliSuggestions(value).map(suggestionToCompletionItem),
          ...rawSuggestions.map(suggestionToCompletionItem),
        ]

        suggestions = _.uniqBy(suggestions, 'label')

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
