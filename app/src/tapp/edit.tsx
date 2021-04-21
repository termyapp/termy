import Editor from '@monaco-editor/react'
import { Div } from '@src/components'
import useStore, { themeSelector } from '@src/store'
import { TERMY } from '@src/termy/input'
import { ipc } from '@src/utils'
import type { Message } from '@types'
import React from 'react'

interface Props {
  path: string
  value: string
  language: string // extension of the file (it's "" if there is none)
}

export default function Edit({ path, value, language }: Props) {
  const theme = useStore(themeSelector)

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
        theme={TERMY}
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
            })
          }
        }}
        options={{
          fontSize: 16,
          suggestFontSize: 16,
          fontFamily: theme.fonts.$mono,
        }}
      />
    </Div>
  )
}
