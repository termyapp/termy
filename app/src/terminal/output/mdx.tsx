import { Card, Path } from '@components'
import Markdown from 'markdown-to-jsx'
import React from 'react'

// Provide custom components for markdown elements
const overrides = {
  Card: { component: Card },
  Path: { component: Path },
}

interface Props {
  children: string
}

const Mdx: React.FC<Props> = ({ children }) => {
  return (
    <Markdown
      options={{
        overrides,
      }}
    >
      {children}
    </Markdown>
  )
}

export default Mdx
