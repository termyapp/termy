import Editor, { monaco } from '@monaco-editor/react'
import type * as Monaco from 'monaco-editor'
import { KeyCode } from 'monaco-editor'
import React, { useEffect, useRef, useState } from 'react'
import type { CellType } from '../../types'
import useStore from '../store'
import { Div } from './shared'

const Input: React.FC<CellType> = ({
  id,
  currentDir,
  value: defaultValue,
  focused,
  status,
}) => {
  const dispatch = useStore(state => state.dispatch)
  const theme = useStore(state => state.theme)
  const inputRef = useRef<HTMLDivElement>(null)

  const monacoRef = useRef<typeof Monaco | null>(null)
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null)
  const [isEditorReady, setIsEditorReady] = useState(false)

  useEffect(() => {
    // todo: https://gist.github.com/mattpowell/221f7d35c4ae1273dc2e1ee469d000a7
    // MonacoReact.config({ paths: { vs: '/monaco-editor' } })

    const background = focused
      ? theme.colors.$focusedBackground
      : theme.colors.$background
    const foreground = focused
      ? theme.colors.$focusedForeground
      : theme.colors.$foreground
    monaco.init().then(monacoInstance => {
      monacoRef.current = monacoInstance
      monacoRef.current.editor.defineTheme('terminal', {
        base: 'vs',
        inherit: true,
        rules: [],
        colors: {
          'editor.foreground': foreground,
          'editor.background': background,
          'editor.lineHighlightBackground': background,
          'editorSuggestWidget.background': background,
          'editorSuggestWidget.highlightForeground': theme.colors.$accent,
        },
      })

      setIsEditorReady(true)
    })
  }, [focused, theme])

  return (
    <>
      <Div
        ref={inputRef}
        css={{
          width: '100%',
          height: '$8',
          position: 'relative',
          // cursor: status === 'running' ? 'default' : 'text',
        }}
      >
        <Div
          css={{
            width: '100%',
            height: '100%',
            position: 'absolute',
          }}
        >
          <Editor
            theme="terminal"
            editorDidMount={(_, editor) => {
              editor.addAction({
                id: 'run-cell',
                label: 'Run cell',
                keybindings: [KeyCode.Enter],

                run: editor => {
                  dispatch({ type: 'run-cell', id, input: editor.getValue() })
                },
              })

              editorRef.current = editor
            }}
            value={defaultValue}
            // ControlledEditor doesn't work
            // onChange={(_, value) => {
            //   dispatch({ type: 'set-cell', id, cell: { value } })
            //   return value
            // }}
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
        id={id}
        autoFocus
        placeholder=">"
        readOnly={status === 'running'}
        onFocus={() => {
              dispatch({ type: 'focus', id })

              if (status !== 'running') {
                Transforms.select(editor, Editor.end(editor, []))
                ReactEditor.focus(editor)
              }
            }}
            onKeyDown={event => {
              if (event.key === 'Enter') {
                event.preventDefault() // prevent multiline input
              }
            }} */}
        </Div>
      </Div>
    </>
  )
}

export default Input
