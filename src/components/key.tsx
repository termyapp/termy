import React, { useRef, useState } from 'react'
import { styled } from '../stitches.config'
// @ts-ignore
import click from '../click.mp3'

interface Props {}

const Key: React.FC<Props> = props => {
  const [pressed, setPressed] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  return (
    <Container>
      <Div
        tabIndex={0}
        onKeyDown={() => {
          if (pressed) return
          setPressed(true)
          audioRef.current?.play()
        }}
        onKeyUp={() => setPressed(false)}
        state={pressed ? 'pressed' : 'default'}
      >
        <audio ref={audioRef}>
          <source type="audio/mp3" src={click} />
        </audio>
        T
      </Div>
    </Container>
  )
}

const Div = styled('kbd', {
  display: 'inline-block',
  color: 'rgb(249, 99, 49)',
  fontSize: '12px',
  p: '$2',
  py: '$1',
  borderRadius: '$3',
  boxShadow: '-3px -3px 5px #FAFBFF, 3px 3px 5px #A6ABBD',
  cursor: 'pointer',
  transition: 'all .07s ease-in-out',

  ':focus': {
    outline: 'none',
  },

  variants: {
    state: {
      default: {},
      pressed: {
        background: 'rgba(0,0,0,.03)',
        boxShadow: '-1px -1px 2px #FAFBFF, 1px 1px 2px #A6ABBD',
      },
    },
  },
})

const Container = styled('div', {
  p: '4px',
  m: '1px',
  background: '#EBECF0',
  borderRadius: '$2',
})

export default Key
