import React, { useEffect, useMemo, useRef, useState } from 'react'
import type { CellType, Message } from '../../types'
import useStore from '../store'
import { Div } from './shared'
import Editor, { monaco } from '@monaco-editor/react'
import type * as Monaco from 'monaco-editor'

if (import.meta.hot) {
  // slate not happy w/ hot reload
  import.meta.hot.decline()
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
  const inputRef = useRef<HTMLDivElement>(null)

  const monacoRef = useRef<typeof Monaco | null>(null)
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null)
  const [isEditorReady, setIsEditorReady] = useState(false)

  useEffect(() => {
    // todo: https://gist.github.com/mattpowell/221f7d35c4ae1273dc2e1ee469d000a7
    // MonacoReact.config({ paths: { vs: '/monaco-editor' } })

    monaco.init().then(monacoInstance => {
      monacoRef.current = monacoInstance
      monacoRef.current.editor.defineTheme('terminal', {
        base: 'vs',
        inherit: true,
        rules: [],
        colors: {
          'editor.foreground': '#000',
          'editor.background': '#fff',
        },
      })

      monacoRef.current.languages.typescript.javascriptDefaults.setEagerModelSync(
        true,
      )
      setIsEditorReady(true)
    })
  }, [])

  return (
    <>
      <Div
        ref={inputRef}
        css={{
          width: '100%',
          height: '$8',
          position: 'relative',
          // color: focused ? '$focusedForeground' : '$foreground',
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
              editorRef.current = editor
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
          {/* <Suggestions
        id={id}
        input={input}
        editor={editor}
        inputRef={inputRef}
        focused={focused}
        currentDir={currentDir}
      /> */}
        </Div>
      </Div>
    </>
  )
}

export default Input
