import React from 'react'
import Api from './api'
import { Card, Div } from './design-system'
import Prompt from './prompt'
import dynamic from 'next/dynamic'
const Pty = dynamic(() => import('./pty'), { ssr: false })

export type Output =
  | { type: 'api'; data: string }
  | { type: 'pty'; data: string }

export type FeatureType = {
  currentDir: string
  input: string
  output: Output
}

const Feature: React.FC<FeatureType> = ({ currentDir, input, output }) => {
  return (
    <Card
      css={{
        backgroundColor: input.includes('000')
          ? '#000'
          : '$focusedBackgroundColor',
        color: input.includes('000') ? '#fff' : '$primaryTextColor',
        minHeight: '200px',

        ':nth-child(2)': {
          gridRow: '1 / 3',
          gridColumnStart: '1',
        },
        ':nth-child(4)': {
          gridRow: '1 / 3',
          gridColumnStart: '3',
        },

        mobile: {
          gridRow: 'auto !important',
          gridColumnStart: 'initial !important',
        },
      }}
    >
      <Prompt currentDir={currentDir} input={input} />
      <Div
        css={{
          position: 'relative',
          width: '100%',
          px: '$4',
          height: '100%',
        }}
      >
        {output.type === 'api' ? <Api {...output} /> : <Pty {...output} />}
      </Div>
    </Card>
  )
}

export default Feature
