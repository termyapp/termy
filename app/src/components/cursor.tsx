import React from 'react'
import { css, styled } from '../stitches.config'

interface Props {}

const Cursor: React.FC<Props> = props => {
  return (
    <Container>
      <Div></Div>
    </Container>
  )
}

const blink = css.keyframes({
  '0%': { opacity: 0 },
  '49%': { opacity: 0 },
  '50%': { opacity: 1 },
  '100%': { opacity: 1 },
})

const Div = styled('div', {
  left: '5px',
  position: 'absolute',
  width: '8px',
  height: '20px',
  borderRadius: '3px',
  backgroundColor: 'rgb(249, 99, 49)',
  transition: 'all .07s ease-in-out',

  ':focus': {
    outline: 'none',
  },

  animation: `${blink} 1s infinite`,
})

const Container = styled('div', {
  p: '4px',
  m: '1px',
  background: '#EBECF0',
  borderRadius: '$2',
  position: 'relative',
  width: '10px',
})

export default Cursor
