import React from 'react'
import { styled } from '../../stitches.config'
import useStore from '../../store'
import Cell from './cell'

const Terminal: React.FC = () => {
  const cells = useStore(state => state.cells)

  // todo: https://github.com/STRML/react-grid-layout
  return (
    <Grid>
      <Tissue>
        {Object.keys(cells).map(key => (
          <Cell key={key} {...cells[key]} />
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
