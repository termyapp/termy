import React from 'react'
import { useKey } from 'react-use'
import { styled } from '../stitches.config'
import useStore from '../store'
import Cell from './cell'
import { Card, Grid, Text } from './shared'

const Terminal: React.FC = () => {
  const cells = useStore(state => state.cells)
  const focused = useStore(state => state.focused)
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
        overflowY: 'scroll',
      }}
    >
      {cells.map(cell => (
        <CellCard
          key={cell.id}
          state={focused === cell.id ? 'focused' : 'default'}
        >
          <Cell {...cell} focused={focused === cell.id} />
        </CellCard>
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

const CellCard = styled(Card, {
  variants: {
    state: {
      default: {
        border: '1px solid transparent',
        color: '$secondaryTextColor',
      },
      focused: {
        border: '1px solid $accentColor',
        backgroundColor: '$focusedBackgroundColor',
      },
    },
  },
})

export default Terminal
