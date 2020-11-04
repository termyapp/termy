import React, { useState } from 'react'
import { styled } from '../stitches.config'

interface Props {}

const Key: React.FC<Props> = props => {
  const [pressed, setPressed] = useState(false)
  return (
    <Div
      tabIndex={0}
      onKeyDown={() => setPressed(true)}
      onKeyUp={() => setPressed(false)}
      state={pressed ? 'pressed' : 'default'}
    >
      T
    </Div>
  )
}

const Div = styled('div', {
  display: 'inline-block',
  color: '$purple600',
  border: '1px solid $purple100',
  borderRadius: '$2',
  p: '$2',
  m: '$6',
  py: '$1',
  cursor: 'pointer',

  ':focus': {
    outline: 'none',
    border: '1px solid $purple200',
  },

  //   boxShadow: '4px 4px 9px #141414, -4px -4px 9px #303030',

  transition: 'all .07s ease-in-out',

  variants: {
    state: {
      default: {},
      pressed: {
        background: '$purple300',
      },
    },
  },
})

export default Key
