import { ipc } from '@src/utils'
import monaco, { TERMY_THEME } from '@src/utils/monaco'
import { Div, theme } from '@termy/ui'
import type { Message } from '@types'
import React, { useEffect, useRef } from 'react'

interface Props {
  path: string
  content: string
  language: string // extension of the file (it's "" if there is none)
}

export default function Edit({ path, content: value, language }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    const editor = monaco.editor.create(ref.current, {
      value,
      language,
      theme: TERMY_THEME,
    })
    editor.updateOptions({
      fontSize: 16,
      suggestFontSize: 16,
      fontFamily: theme.fonts.mono,
    })

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
  }, [value, language])

  return (
    <Div
      ref={ref}
      css={{
        width: '100%',
        height: '100%',
        position: 'absolute',
      }}
    />
  )
}
