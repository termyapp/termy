import React, { useCallback, useEffect } from 'react'
import { useKey } from 'react-use'
import shallow from 'zustand/shallow'
import useStore, { focusCell } from '../store'
import Cell from './cell'
import { Grid } from './shared'

const Tab: React.FC = () => {
  // Mapped picks, re-renders the component when state.treats changes in order, count or keys
  const cellIds = useStore(
    useCallback(state => Object.keys(state.cells), []),
    shallow,
  )
  const focusedCellId = useStore(state => state.focus) // this might rerender all the cells on change
  const dispatch = useStore(state => state.dispatch)

  useKey('n', e => e.metaKey && dispatch({ type: 'new' }))
  useKey('j', e => e.metaKey && dispatch({ type: 'focus-next' }))
  useKey('k', e => e.metaKey && dispatch({ type: 'focus-previous' }))
  useKey(
    'w',
    e => {
      if (e.metaKey) {
        e.preventDefault()
        dispatch({ type: 'remove', id: focusedCellId })
      }
    },
    {},
    [focusedCellId],
  )

  // useEffect(() => {
  //   focusCell(focusedCellId)
  // }, [focusedCellId])

  return (
    <Grid
      css={{
        height: '100%',
        gridAutoRows: 'minmax(0, 1fr)',
        rowGap: '$2',
      }}
    >
      {cellIds.map(id => (
        <Cell key={id} id={id} focused={id === focusedCellId} />
      ))}
    </Grid>
  )
}

export default Tab
