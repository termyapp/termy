import { Card, Path, Table } from '@components'
import Markdown from 'markdown-to-jsx'
import React from 'react'

// Provide custom components for markdown elements
const overrides = {
  Card: { component: Card },
  Path: { component: Path },
  Table: { component: Table },
}

interface Props {
  children: string
}

export default function Mdx({ children }: Props) {
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
