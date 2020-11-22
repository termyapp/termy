import React from 'react'
import Editor from '@monaco-editor/react'
import { Div } from './design-system'

interface Props {}

const Edit: React.FC<Props> = props => {
  return (
    <Div
      css={{
        position: 'absolute',
        top: 0,
        left: '-$4',

        width: '100%',
        height: '100%',
      }}
    >
      <Editor
        height="90%"
        width="100%"
        language="markdown"
        // @ts-ignore
        value={props.children}
      />
    </Div>
  )
}

export default Edit
