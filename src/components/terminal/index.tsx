import React, { useState } from 'react'
import { useKey } from 'react-use'
import useStore from '../../store'
import { Grid, Tile } from '../shared'
import Cell from './cell'

const Terminal: React.FC = () => {
  const cells = useStore(state => state.cells)
  const dispatch = useStore(state => state.dispatch)
  const [focused, setFocused] = useState(Object.keys(cells)[0])

  useKey('j', e => e.metaKey && dispatch({ type: 'new' }))

  // todo: https://github.com/STRML/react-grid-layout
  return (
    <Grid
      css={{
        mt: '1.6rem', // todo: avoid traffic lights colliding
        minHeight: 'calc(100vh - 1.6rem - 0.5rem * 2)',
        p: '0.5rem',

        rowGap: '$2',
      }}
    >
      {Object.keys(cells).map(key => (
        <Tile key={key} css={{}}>
          <Cell {...cells[key]} />
        </Tile>
      ))}
    </Grid>
  )
}

export default Terminal
