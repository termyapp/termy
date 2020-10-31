import React, { useRef } from 'react'
import { styled } from '../../stitches.config'
import useStore from '../../store'
import Cell from './cell'

const Terminal: React.FC = () => {
  const { cells } = useStore()
  const mainRef = useRef<HTMLDivElement>(null)

  // todo: https://github.com/STRML/react-grid-layout
  return (
    <Grid ref={mainRef}>
      <Tissue>
        {cells.map((command, i) => (
          <Cell key={command.id} {...command} />
        ))}
      </Tissue>
    </Grid>
  )
}

const Grid = styled('div', {
  position: 'relative',
  overflow: 'hidden',
  height: '100vh',
})

// 'cause cells form tissues
const Tissue = styled('div', {
  overflow: 'hidden',
  height: '100%',
  mt: '500px',
})

export default Terminal
