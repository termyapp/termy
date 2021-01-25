import { Grid } from '@components'
import React, { useCallback } from 'react'
import shallow from 'zustand/shallow'
import useStore from '../store'
import Cell from './cell'

const Tab: React.FC<{ tabId: string; active: boolean }> = ({
  tabId,
  active,
}) => {
  // Mapped picks, re-renders the component when state.cells changes in order, count or keys
  const cellIds = useStore(
    useCallback(state => Object.keys(state.tabs[tabId]), []),
    shallow,
  )
  const focusedCellId = useStore(state => state.focus) // this might rerender all the cells on change

  return (
    <Grid
      css={{
        display: active ? 'grid' : 'none',
        height: '100%',
        gridAutoRows: 'minmax(0, 1fr)',
        rowGap: '$2',
      }}
    >
      {cellIds.map(id => (
        <Cell key={id} id={id} focused={id === focusedCellId} tabId={tabId} />
      ))}
    </Grid>
  )
}

export default Tab
