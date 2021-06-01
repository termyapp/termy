import useStore from '@src/store'
import type { theme } from '@termy/ui'
import type { NativeSuggestion, Suggestion, SuggestionKind } from '@types'
import { formatDistanceToNow } from 'date-fns'
import _ from 'lodash'
import * as monaco from 'monaco-editor'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
import { getTypedCliSuggestions, ipc } from './'

export const TERMY_THEME = 'shell'

// @ts-ignore
self.MonacoEnvironment = {
  getWorker(_: any, label: string) {
    if (label === 'json') {
      return new jsonWorker()
    }
    if (label === 'css' || label === 'scss' || label === 'less') {
      return new cssWorker()
    }
    if (label === 'html' || label === 'handlebars' || label === 'razor') {
      return new htmlWorker()
    }
    if (label === 'typescript' || label === 'javascript') {
      return new tsWorker()
    }
    return new editorWorker()
  },
}

export default monaco

export function updateMonacoTheme(colors: typeof theme.colors) {
  const themeData = {
    base: colors.base.value as monaco.editor.BuiltinTheme,
    inherit: true,
    rules: [],

    colors: {
      // monaco doesn't allow instances to have different themes
      'editor.background': colors.background.value,
      'editor.foreground': colors.foreground.value,
      'editor.lineHighlightBackground': colors.background.value,
      'editorSuggestWidget.background': colors.background.value,
      'editor.selectionBackground': colors.selection.value,
      'editor.selectionHighlightBackground': colors.background.value,
      'editorCursor.foreground': colors.primary.value,
    },
  }
  monaco.editor.defineTheme(TERMY_THEME, themeData)
  monaco.editor.setTheme(TERMY_THEME) // force re-render
}

export function initSuggestions() {
  monaco.languages.registerCompletionItemProvider(TERMY_THEME, {
    triggerCharacters: [' ', '/', '.'],
    provideCompletionItems: async (
      model: monaco.editor.ITextModel,
      position: monaco.Position,
      context: monaco.languages.CompletionContext,
      token: monaco.CancellationToken,
    ) => {
      const value = model.getValue()
      const cellId = model.uri.authority
      const currentDir = useStore.getState().cells[cellId].currentDir

      const rawSuggestions: NativeSuggestion[] = await ipc.invoke({
        type: 'get-suggestions',
        value,
        currentDir,
      })

      const withValue = suggestionToCompletionItem(value)
      let suggestions: monaco.languages.CompletionItem[] = [
        ...getTypedCliSuggestions(value).map(withValue),
        ...rawSuggestions.map(withValue),
      ]

      suggestions = _.uniqBy(suggestions, 'label')

      console.debug('SUGGESTIONS', suggestions)

      return { incomplete: false, suggestions }
    },
  })
}

const suggestionToCompletionItem =
  (value: string) =>
  (suggestion: Suggestion | NativeSuggestion): monaco.languages.CompletionItem => {
    let label: unknown = suggestion.label

    if ('date' in suggestion && suggestion.date) {
      label = {
        name: label,
        qualifier: `Modified ${formatDistanceToNow(parseInt(suggestion.date))} ago`,
      }
    }

    let insertText = suggestion.insertText ? suggestion.insertText : suggestion.label

    if (
      value.length > 0 &&
      insertText.length > 0 &&
      insertText[0] === '.' &&
      value[value.length - 1] === '.'
    ) {
      // make sure '.termy' suggestion gets inserted as '.termy' and not '..termy'
      insertText = insertText.substring(1)
    }

    return {
      label,
      insertText,
      kind: getItemKind(suggestion.kind),
      documentation: suggestion.documentation ? { value: suggestion.documentation } : undefined,
    } as monaco.languages.CompletionItem
  }

function getItemKind(kind: SuggestionKind) {
  // info: https://user-images.githubusercontent.com/35271042/96901834-9bdbb480-1448-11eb-906a-4a80f5f14921.png
  const { File, Folder, Event, EnumMember, Enum, Text } = monaco.languages.CompletionItemKind
  switch (kind) {
    case 'file':
      return File
    case 'directory':
      return Folder
    case 'executable':
      return Event
    case 'history':
      return EnumMember
    case 'externalHistory':
      return Enum
    default:
      return Text
  }
}
