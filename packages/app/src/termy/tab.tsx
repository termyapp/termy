import * as ReactTabs from '@radix-ui/react-tabs'
import { useMousetrap } from '@src/hooks'
import { focusCell } from '@src/utils'
import { styled } from '@termy/ui'
import React, { useCallback, useEffect } from 'react'
import useStore, { dispatchSelector } from '../store'
import Cell from './cell'

interface Props {
  id: string
  index: number
  activeTab: string
}

export default function Tab({ id, index, activeTab }: Props) {
  const dispatch = useStore(dispatchSelector)
  const cellIds = useStore(useCallback(state => state.tabs[id].cells, [id]))
  const activeCell = useStore(useCallback(state => state.cells[state.tabs[id].activeCell], [id]))

  // todo: Mod + 9 should focus last tab? what about Mod + 0?
  useMousetrap(`mod+${index + 1}`, () => {
    dispatch({ type: 'focus-tab', id })
  })

  // focus input
  useMousetrap(
    'mod+i',
    () => {
      focusCell(activeCell.id, null)
    },
    undefined,
    [activeCell.id],
  )

  // focus output
  useMousetrap(
    'mod+o',
    () => {
      focusCell(activeCell.id, 'running')
    },
    undefined,
    [activeCell.id],
  )

  useEffect(() => {
    if (activeTab === id) focusCell(activeCell.id, activeCell.status)
  }, [activeTab, activeCell.id, activeCell.status])

  return (
    <StyledPanel value={id}>
      {cellIds.map(id => (
        <Cell
          key={id}
          id={id}
          active={id === activeCell.id}
          showBorder={id === activeCell.id && cellIds.length > 1}
        />
      ))}
    </StyledPanel>
  )
}

const StyledPanel = styled(ReactTabs.Panel, {
  flexGrow: 1,
  height: '100%',
  display: 'grid',
  gridAutoRows: 'minmax(0, 1fr)',
  rowGap: '$2',
  py: '$1',

  '&[hidden]': {
    display: 'none',
  },
})
