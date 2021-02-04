import { Grid } from '@components'
import { useMousetrap } from '@src/hooks'
import React, { useCallback, useEffect } from 'react'
import shallow from 'zustand/shallow'
import useStore from '../store'
import Cell, { focusCell } from './cell'

const Tab: React.FC<{
  id: string
  index: number
  activeTab: string
}> = ({ id, index, activeTab }) => {
  const cellIds = useStore(
    useCallback(state => state.tabs[id].cells, [id]),
    shallow,
  )
  const activeCell = useStore(
    useCallback(state => state.tabs[id].activeCell, [id]),
    shallow,
  )
  const dispatch = useStore(state => state.dispatch)

  useMousetrap(`meta+${index + 1}`, () => {
    dispatch({ type: 'focus-tab', id })
  })

  useEffect(() => {
    if (activeTab === id) {
      focusCell(activeCell)
    }
  }, [activeTab, activeCell])

  return (
    <Grid
      css={{
        display: activeTab === id ? 'grid' : 'none',
        height: '100%',
        gridAutoRows: 'minmax(0, 1fr)',
        rowGap: '$2',
      }}
    >
      {cellIds.map(cellId => (
        <Cell key={cellId} id={cellId} active={cellId === activeCell} />
      ))}
    </Grid>
  )
}

export default Tab
