import { ControlledEditor, monaco as MonacoReact } from '@monaco-editor/react'
import { formatDistanceToNow } from 'date-fns'
import * as Monaco from 'monaco-editor'
import { KeyCode, KeyMod } from 'monaco-editor'
import React, { useEffect, useRef, useState } from 'react'
import type {
  CellType,
  NativeSuggestion,
  Suggestion,
  SuggestionKind,
} from '../../types'
import { getTypedCliSuggestions, ipc } from '../lib'
import useStore from '../store'
import { Div } from './shared'

export const TERMY = 'shell'
// todo: use a custom language model
// we are currently using shell as lang to make suggestions work
// monaco.editor.createModel('', TERMY)

const toMonacoKind = (kind: SuggestionKind) => {
  // info: https://user-images.githubusercontent.com/35271042/96901834-9bdbb480-1448-11eb-906a-4a80f5f14921.png
  switch (kind) {
    case 'executable':
      return Monaco.languages.CompletionItemKind.Event
    case 'directory':
      return Monaco.languages.CompletionItemKind.Folder
    case 'externalHistory':
      return Monaco.languages.CompletionItemKind.Enum
    default:
      return Monaco.languages.CompletionItemKind.Text
  }
}

const Input: React.FC<CellType> = ({
  id,
  currentDir,
  value,
  focused,
  status,
}) => {
  const dispatch = useStore(state => state.dispatch)
  const theme = useStore(state => state.theme)

  const currentDirRef = useRef<string>(currentDir)
  const monacoRef = useRef<typeof Monaco | null>(null)
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null)
  const [isEditorReady, setIsEditorReady] = useState(false)

  useEffect(() => {
    currentDirRef.current = currentDir
  }, [currentDir])

  useEffect(() => {
    // todo: load packaged monaco
    // MonacoReact.config({ paths: { vs: '/monaco-editor' } })
    // https://gist.github.com/mattpowell/221f7d35c4ae1273dc2e1ee469d000a7

    MonacoReact.init().then(monaco => {
      monaco.editor.defineTheme(TERMY, {
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

      monaco.languages.registerCompletionItemProvider(TERMY, {
        triggerCharacters: [' ', '/'],
        provideCompletionItems: async (
          model: Monaco.editor.ITextModel,
          position: Monaco.Position,
          context: Monaco.languages.CompletionContext,
          token: Monaco.CancellationToken,
        ) => {
          const input = model.getValue()
          const rawSuggestions: NativeSuggestion[] = await ipc.invoke(
            'suggestions',
            input,
            currentDirRef.current,
          )
          const suggestions: Monaco.languages.CompletionItem[] = rawSuggestions.map(
            suggestionToCompletionItem,
          )

          console.log(input, currentDirRef.current, suggestions)
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

      monacoRef.current = monaco

      setIsEditorReady(true)
    })
  }, [])

  return (
    <>
      <Div
        css={{
          width: '100%',
          height: '$8',
          position: 'relative',
        }}
      >
        <Div
          id={id}
          css={{
            width: '100%',
            height: '100%',
            position: 'absolute',
          }}
          onFocus={() => {
            if (status !== 'running') {
              editorRef.current?.focus()
            }
          }}
          tabIndex={0}
        >
          <ControlledEditor
            key={theme.colors.$background}
            theme={TERMY}
            language={TERMY}
            editorDidMount={(_, editor) => {
              // run cell on enter
              editor.addAction({
                id: 'run-cell',
                label: 'Run cell',
                keybindings: [KeyCode.Enter],
                // https://code.visualstudio.com/docs/getstarted/keybindings#_available-contexts
                precondition: '!suggestWidgetVisible',
                run: editor => {
                  dispatch({ type: 'run-cell', id, input: editor.getValue() })
                },
              })

              // override default CtrlCmd + K
              editor.addCommand(KeyMod.CtrlCmd | KeyCode.KEY_K, () => {
                dispatch({ type: 'focus-previous' })
              })

              // auto focus on init
              editor.focus()

              // move cursor to the end of the line
              editor.setPosition({
                lineNumber: Number.MAX_SAFE_INTEGER,
                column: 1,
              })

              editorRef.current = editor
            }}
            value={value}
            onChange={(_, value) => {
              dispatch({ type: 'set-cell', id, cell: { value } })
              return value
            }}
            options={{
              // remove margin
              glyphMargin: false,
              folding: false,
              lineNumbers: 'off',
              lineDecorationsWidth: 0,
              lineNumbersMinChars: 0,

              padding: {
                top: 0,
                bottom: 0,
              },
              fontSize: 20,
              suggestFontSize: 16,
              fontFamily: theme.fonts.$mono,
              fontWeight: theme.fontWeights.$medium,

              minimap: { enabled: false },
              scrollbar: {
                vertical: 'hidden',
                horizontal: 'hidden',
              },
              overviewRulerLanes: 0,
              quickSuggestions: true,
              quickSuggestionsDelay: 0,
              // model: this.model,
            }}
          />
          {/*
            readOnly={status === 'running'}
            cursor: status === 'running' ? 'default' : 'text',
            */}
        </Div>
      </Div>
    </>
  )
}

const suggestionToCompletionItem = (
  suggestion: Suggestion | NativeSuggestion,
): Monaco.languages.CompletionItem => {
  let documentation = suggestion.documentation
  if ('tldrDocumentation' in suggestion) {
    documentation = suggestion.tldrDocumentation
  }

  let label: any = suggestion.label
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

export default Input
