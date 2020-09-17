import React from 'react'
import { Text } from './text'

export const Logo = () => {
  return (
    <Text
      css={{
        fontFamily: 'Futura',
        fontSize: '$6',
        letterSpacing: -0.8,
        fontWeight: 'bold',
        background:
          'linear-gradient(to right bottom, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, .2) 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        lineHeight: 1.3, // somehow it clips it if it's not heigh enough?!

        position: 'relative',
      }}
    >
      Termy
      <Text
        css={{
          position: 'absolute',
          top: 0,
          left: '105%',
          WebkitTextFillColor: 'rgba(200, 10, 10, .8)',
          background: 'rgba(200, 10, 10, .2)',
          px: '$1',
          lineHeight: 1.7,
          br: '$2',
          fontWeight: 400,
          fontSize: '9px',
          letterSpacing: '.4px',
          pointerEvents: 'none',
        }}
      >
        Alpha
      </Text>
    </Text>
  )
}
