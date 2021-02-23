import { Grid } from '@components'
import { useMousetrap } from '@src/hooks'
import { focusCell } from '@src/utils'
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
  const dispatch = useStore(state => state.dispatch)
  const cellIds = useStore(
    useCallback(state => state.tabs[id].cells, [id]),
    shallow,
  )
  const activeCellId = useStore(
    useCallback(state => state.tabs[id].activeCell, [id]),
    shallow,
  )
  const activeCellStatus = useStore(
    useCallback(state => state.cells[activeCellId].status, [activeCellId]),
    shallow,
  )

  useMousetrap(`mod+${index + 1}`, () => {
    dispatch({ type: 'focus-tab', id })
  })

  // focus input
  useMousetrap(
    'mod+i',
    () => {
      focusCell(activeCellId, null)
    },
    undefined,
    [activeCellId],
  )

  // focus output
  useMousetrap(
    'mod+o',
    () => {
      focusCell(activeCellId, 'running')
    },
    undefined,
    [activeCellId],
  )

  useEffect(() => {
    if (activeTab === id) focusCell(activeCellId, activeCellStatus)
  }, [activeTab, activeCellId, activeCellStatus])

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
