import Editor from '@monaco-editor/react'
import React, { useRef } from 'react'
import { PortalFunctionParams } from 'react-portal'
import { useKey } from 'react-use'
import { getLanguage, readFile, writeFile } from '../../lib'

interface Props {
  path: string
}

const Edit = ({
  path,
  isOpen,

  closePortal,
  portal,
}: Props & PortalFunctionParams) => {
  const valueGetter = useRef()
  const language = getLanguage(path)

  useKey(
    's',
    e => {
      if (!e.metaKey) return

      // @ts-ignore
      writeFile(path, valueGetter.current())
    },
    {},
    [path, valueGetter],
  )
  useKey('Escape', closePortal, {}, [closePortal])

  return isOpen
    ? portal(
        <div className="absolute inset-0">
          <Editor
            height="100vh"
            theme="dark"
            language={language}
            editorDidMount={getValue => {
              // @ts-ignore
              valueGetter.current = getValue
            }}
            value={readFile(path)}
          />
        </div>,
      )
    : null
}

export default Edit
