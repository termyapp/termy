import React from 'react'
import Markdown from 'markdown-to-jsx'

import { Card } from './design-system'
import { Output } from './feature'
import Edit from './edit'

// Provide custom components for markdown elements
const overrides = {
  Card: { component: Card },
  // Path: { component: Path },
}

const Api: React.FC<Output> = ({ data }) => {
  return data.includes('## Motivation') ? (
    <Edit>{data}</Edit>
  ) : (
    <Markdown
      options={{
        overrides,
      }}
    >
      {data}
    </Markdown>
  )
}

export default Api
