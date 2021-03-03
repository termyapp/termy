import Editor from '@monaco-editor/react'
import { Div } from '@src/components'
import { ipc } from '@src/utils'
import type { Message } from '@types'
import React from 'react'

interface Props {
  path: string
  value: string // base64
  language?: string
}

export default function Edit({ path, value, language }: Props) {
  value = decodeURIComponent(escape(atob(value))) // decode

  return (
    <Div
      css={{
        width: '100%',
        height: '100%',
        position: 'absolute',
      }}
    >
      <Editor
        key={path + value} // wouldn't rerender otherwise when running `edit` twice
        defaultLanguage={language}
        defaultValue={value}
        onMount={(editor, monaco) => {
          if (monaco) {
            const { KeyCode, KeyMod } = monaco

            // save
            editor.addCommand(KeyMod.CtrlCmd | KeyCode.KEY_S, () => {
              const value = editor.getModel()?.getValue()
              ipc.sync({
                type: 'write',
                path,
                value,
              } as Message)
              console.log('saved', path, value)
            })
          }
        }}
      />
    </Div>
  )
}
