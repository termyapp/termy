import { Grid } from '@components'
import { useMousetrap } from '@src/hooks'
import { focusCell } from '@src/store/helpers'
import React, { useCallback, useEffect } from 'react'
import shallow from 'zustand/shallow'
import useStore from '../store'
import Cell from './cell'

interface Props {
  id: string
  index: number
  activeTab: string
}

export default function Tab({ id, index, activeTab }: Props) {
  const cellIds = useStore(
    useCallback(state => state.tabs[id].cells, [id]),
    shallow,
  )
  const activeCellId = useStore(
    useCallback(state => state.tabs[id].activeCell, [id]),
    shallow,
  )
  const activeCell = useStore(
    useCallback(state => state.cells[activeCellId], [activeCellId]),
    shallow,
  )
  const dispatch = useStore(state => state.dispatch)

  useMousetrap(`mod+${index + 1}`, () => {
    dispatch({ type: 'focus-tab', id })
  })

  useEffect(() => {
    // doesn't work in focus-tab because the active cell is not yet focusable
    focusCell(activeCellId, activeCell.status)
  }, [activeTab])

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
        <Cell
          key={cellId}
          id={cellId}
          active={cellId === activeCellId}
          showBorder={cellId === activeCellId && cellIds.length > 1}
        />
      ))}
    </Grid>
  )
}
