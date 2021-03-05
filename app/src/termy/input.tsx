import Editor from '@monaco-editor/react'
import useStore, { dispatchSelector, themeSelector } from '@src/store'
// only import it as type, otherwise it overrides @monaco-editor/react instance
import type * as Monaco from 'monaco-editor'
import React, { useEffect, useRef } from 'react'
import type { CellWithActive } from '../../types'
import { Div } from '../components'

export const TERMY = 'shell'

export default function Input({
  id,
  currentDir,
  value,
  status,
  active,
}: CellWithActive) {
  const dispatch = useStore(dispatchSelector)
  const theme = useStore(themeSelector)

  const currentDirRef = useRef<string>(currentDir)
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null)

  // update current dir ref
  useEffect(() => {
    currentDirRef.current = currentDir
  }, [currentDir])

  useEffect(() => {
    if (editorRef.current !== null) {
      // toggle readonly
      editorRef.current.updateOptions({
        readOnly: status === 'running',
      })

      // select input on finish
      if (status === 'success' || status === 'error') {
        const range = editorRef.current.getModel()?.getFullModelRange()
        if (range) editorRef.current.setSelection(range)
      }
    }
  }, [status, active])

  return (
    <>
      <Div
        css={{
          width: '100%',
          height: '25px',
          position: 'relative',
        }}
      >
        <Div
          id={`input-${id}`}
          tabIndex={-1} // make it focusable
          onFocus={() => {
            editorRef.current?.focus()
          }}
          css={{
            width: '100%',
            height: '100%',
            position: 'absolute',
          }}
        >
          <Editor
            theme={TERMY}
            language={TERMY}
            onMount={(editor, monaco) => {
              const model = monaco.editor.createModel(
                value,
                TERMY,
                monaco.Uri.parse(`cell://${id}`),
              )
              editor.setModel(model)

              if (monaco) {
                const { KeyCode, KeyMod } = monaco

                // Contexts:
                // https://code.visualstudio.com/docs/getstarted/keybindings#_available-contexts

                editor.addCommand(KeyCode.Enter, () => {
                  editor.trigger('', 'hideSuggestWidget', {})
                  dispatch({ type: 'run-cell', id })
                })

                editor.addCommand(KeyMod.CtrlCmd | KeyCode.Enter, () => {
                  editor.trigger('', 'acceptSelectedSuggestion', {})
                  dispatch({ type: 'run-cell', id })
                })

                editor.addCommand(
                  KeyCode.Tab,
                  () => {
                    editor.trigger('', 'acceptSelectedSuggestion', {})
                    editor.trigger('', 'editor.action.triggerSuggest', {})
                  },
                  'suggestWidgetVisible',
                )

                editor.addCommand(
                  KeyCode.Tab,
                  () => {
                    editor.trigger('', 'editor.action.triggerSuggest', {})
                  },
                  '!suggestWidgetVisible',
                )

                // override default CtrlCmd + K
                editor.addCommand(KeyMod.CtrlCmd | KeyCode.KEY_K, () => {
                  dispatch({ type: 'focus-cell', id: 'previous' })
                })
              }

              // https://github.com/microsoft/monaco-editor/issues/102
              ;(editor as any)._standaloneKeybindingService.addDynamicKeybinding(
                `-actions.find`,
                undefined,
                () => {},
              )

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
            onChange={(value = '', event) => {
              // reset status
              if (status === 'error' || status === 'success') {
                dispatch({ type: 'set-cell', id, cell: { status: null } })
              }

              // remove line breaks
              value = value.replace(/\n|\r/g, '')

              dispatch({ type: 'set-cell', id, cell: { value } })
            }}
            overrideServices={{
              // Enable expandSuggestionDocs by default (otherwise one would have to press Ctrl + Space each time)
              // https://github.com/microsoft/monaco-editor/issues/2241
              storageService: {
                get() {},
                remove() {},
                getBoolean(key: any) {
                  // if (key === "expandSuggestionDocs")
                  return true
                },
                getNumber(key: any) {
                  return 0
                },
                store() {},
                onWillSaveState() {},
                onDidChangeStorage() {},
              },
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
              fontSize: 18,
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
              // contextmenu: false,
              // model: this.model,
            }}
          />
        </Div>
      </Div>
    </>
  )
}
