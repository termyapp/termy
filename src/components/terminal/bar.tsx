import React from 'react'
import { styled } from '../../stitches.config'

interface Props {
  currentDir: string
}

const Bar: React.FC<Props> = ({ currentDir }) => {
  return (
    <Container>
      <CurrentDir>{currentDir}</CurrentDir>
      <Branch>
        on <span>main</span>
      </Branch>
    </Container>
  )
}

const Container = styled('div', {
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'nowrap',
  py: '$1',
  px: '$2',
  background: 'blue',
  fontSize: '$2',
})

const CurrentDir = styled('div', {
  fontWeight: 'bolder',
})

const Branch = styled('div', {
  marginLeft: '$1',

  span: {
    fontWeight: 'bold',
  },
})

export default Bar
