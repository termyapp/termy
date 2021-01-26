import { Grid } from '@components'
import { useMouseTrap } from '@src/hooks'
import React, { useCallback } from 'react'
import shallow from 'zustand/shallow'
import useStore from '../store'
import Cell from './cell'

const Tab: React.FC<{ id: string; active: boolean; index: number }> = ({
  id,
  active,
  index,
}) => {
  // Mapped picks, re-renders the component when state.cells changes in order, count or keys
  const cellIds = useStore(
    useCallback(state => Object.keys(state.tabs[id]), []),
    shallow,
  )
  const focusedCellId = useStore(state => state.focus) // this might rerender all the cells on change
  const dispatch = useStore(state => state.dispatch)

  useMouseTrap(`meta+${index + 1}`, () => {
    dispatch({ type: 'focus-tab', id })
  })

  return (
    <Grid
      css={{
        display: active ? 'grid' : 'none',
        height: '100%',
        gridAutoRows: 'minmax(0, 1fr)',
        rowGap: '$2',
      }}
    >
      {cellIds.map(cellId => (
        <Cell
          key={cellId}
          id={cellId}
          focused={cellId === focusedCellId}
          tabId={id}
        />
      ))}
    </Grid>
  )
}

export default Tab
