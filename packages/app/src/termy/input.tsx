import useStore, { dispatchSelector } from '@src/store'
import monaco, { TERMY_THEME } from '@src/utils/monaco'
import { Div, theme } from '@termy/ui'
import type { CellWithActive } from '@types'
import React, { useEffect, useRef } from 'react'

export default function Input({ id, currentDir, value, status, active }: CellWithActive) {
  const dispatch = useStore(dispatchSelector)

  const ref = useRef<HTMLDivElement>(null)
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
  const currentDirRef = useRef<string>(currentDir)

  useEffect(() => {
    if (!ref.current || editorRef.current) return

    const model = monaco.editor.createModel(value, TERMY_THEME, monaco.Uri.parse(`cell://${id}`))
    const editor = monaco.editor.create(
      ref.current,
      {
        ...options,
        value,
        language: TERMY_THEME,
        theme: TERMY_THEME,
        model,
      },
      override,
    )

    // Custom Commands
    //
    // Contexts:
    // https://code.visualstudio.com/docs/getstarted/keybindings#_available-contexts
    const { KeyCode, KeyMod } = monaco
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
    // https://github.com/microsoft/monaco-editor/issues/102
    ;(editor as any)._standaloneKeybindingService.addDynamicKeybinding(
      `-actions.find`,
      undefined,
      () => {},
    )

    // auto focus on init
    editor.focus()

    // move cursor to the end
    editor.setPosition({
      lineNumber: Number.MAX_SAFE_INTEGER,
      column: Number.MAX_SAFE_INTEGER,
    })

    editorRef.current = editor

    return () => {
      editorRef.current = null
      editor.getModel()?.dispose()
      editor.dispose()
    }
  }, [id])

  // update current dir ref
  useEffect(() => {
    currentDirRef.current = currentDir
  }, [currentDir])

  useEffect(() => {
    const editor = editorRef.current
    if (!editor) return

    // onChange
    editor.getModel()?.onDidChangeContent(_event => {
      let value = editor.getValue()
      // reset status
      if (status === 'error' || status === 'success') {
        dispatch({ type: 'set-cell', id, cell: { status: null } })
      }

      // remove line breaks
      value = value.replace(/\n|\r/g, '')

      dispatch({ type: 'set-cell', id, cell: { value } })
    })

    // toggle readonly
    // editorRef.current.updateOptions({
    //   readOnly: status === 'running',
    // })

    // select input on finish
    if (status === 'success' || status === 'error') {
      const range = editor.getModel()?.getFullModelRange()
      if (range) editor.setSelection(range)
    }
  }, [status, id])

  return (
    <Div
      css={{
        width: '100%',
        height: '27px',
        position: 'relative',
      }}
    >
      <Div
        ref={ref}
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
      />
    </Div>
  )
}

const options: monaco.editor.IEditorOptions = {
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
  suggestFontSize: 14,
  fontFamily: theme.fonts.mono,
  fontWeight: theme.fontWeights.medium,

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
}

const override: monaco.editor.IEditorOverrideServices = {
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
}
