import React from 'react'
import { useKey } from 'react-use'
import useStore from '../store'
import Cell from './cell'
import { Grid, Text } from './shared'

const Terminal: React.FC = () => {
  const cells = useStore(state => state.cells)
  const dispatch = useStore(state => state.dispatch)

  useKey('j', e => e.metaKey && dispatch({ type: 'new' }))

  useKey('ArrowDown', () => dispatch({ type: 'focus-down' }))
  useKey('ArrowUp', () => dispatch({ type: 'focus-up' }))

  // todo: https://github.com/STRML/react-grid-layout
  return (
    <Grid
      css={{
        p: '$1',
        rowGap: '$1',
      }}
    >
      {cells.map(cell => (
        <Cell key={cell.id} {...cell} />
      ))}
      <Text
        css={{
          my: '$3',
          textAlign: 'center',
          color: '$gray600',
          fontSize: '$sm',
        }}
      >
        Press ⌘ + J to insert a new cell
      </Text>
    </Grid>
  )
}

export default Terminal
