import { Card, Path, Table } from '@components'
import Edit from '@src/tapp/edit'
import Markdown from 'markdown-to-jsx'
import React from 'react'

// Provide custom components for markdown elements
const overrides = {
  Card,
  Path,
  Table,
  Edit,
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
