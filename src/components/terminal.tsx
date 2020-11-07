import React, { useState } from 'react'
import { useKey } from 'react-use'
import useStore from '../store'
import { Text, Grid, Tile } from './shared'
import Cell from './cell'
import { styled } from '../stitches.config'

const Terminal: React.FC = () => {
  const cells = useStore(state => state.cells)
  const focused = useStore(state => state.focused)
  const dispatch = useStore(state => state.dispatch)

  useKey('j', e => e.metaKey && dispatch({ type: 'new' }))
  useKey('ArrowDown', e => e.metaKey && dispatch({ type: 'new' }))

  // todo: https://github.com/STRML/react-grid-layout
  return (
    <Grid
      css={{
        mt: '1.6rem', // todo: avoid traffic lights colliding
        // minHeight: 'calc(100vh - 1.6rem - 0.5rem * 2)',
        p: '0.5rem',

        rowGap: '$2',
      }}
    >
      {cells.map(cell => (
        <CellTile
          key={cell.id}
          state={focused === cell.id ? 'focused' : 'default'}
        >
          <Cell {...cell} />
        </CellTile>
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

const CellTile = styled(Tile, {
  variants: {
    state: {
      default: {
        border: '3px solid transparent',
        color: '$secondaryTextColor',
      },
      focused: {
        border: '3px solid $accentColor',
      },
    },
  },
})

export default Terminal
