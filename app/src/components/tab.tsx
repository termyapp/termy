import React, { useCallback } from 'react'
import { useKey } from 'react-use'
import shallow from 'zustand/shallow'
import useStore from '../store'
import Cell from './cell'
import { Grid } from './shared'

const Tab: React.FC = () => {
  // Mapped picks, re-renders the component when state.treats changes in order, count or keys
  const cellIds = useStore(
    useCallback(state => Object.keys(state.cells), []),
    shallow,
  )
  const dispatch = useStore(state => state.dispatch)
  useKey('d', e => e.metaKey && dispatch({ type: 'new' }))

  return (
    <Grid
      css={{
        height: '100%',
        gridAutoRows: '1fr',
        rowGap: '$2',
      }}
    >
      {cellIds.map(id => (
        <Cell key={id} id={id} />
      ))}
    </Grid>
  )
}

export default Tab
