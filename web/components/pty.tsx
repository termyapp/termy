import React from 'react'

import { styled } from '../stitches.config'
import { Output } from './feature'
import { Div } from './design-system'

const Pty: React.FC<Output> = output => {
  return (
    <Div
      as="pre"
      css={{
        margin: 0,
        display: 'inline-block',
        fontFamily: '$mono',
      }}
    >
      {output.data}
    </Div>
  )
}

export default Pty
