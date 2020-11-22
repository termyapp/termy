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
          'linear-gradient(to right bottom, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, .9) 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        lineHeight: 1.3, // somehow it clips it if it's not heigh enough?!
        position: 'relative',
        textDecoration: 'none',
      }}
    >
      Termy
      <Text
        css={{
          position: 'absolute',
          top: -8,
          left: 'calc(100% - 10px)',
          WebkitTextFillColor: 'rgba(200, 10, 10, .8)',
          backgroundColor: '$orange200',
          px: '$1',
          lineHeight: 1.7,
          fontWeight: 400,
          fontSize: '10px',
          borderRadius: '$lg',
          letterSpacing: '.4px',
          pointerEvents: 'none',
          zIndex: -1,
        }}
      >
        Beta
      </Text>
    </Text>
  )
}
