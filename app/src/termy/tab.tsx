import { Div, Flex, Grid, Path, Span } from '@components'
import { useMousetrap } from '@src/hooks'
import { focusCell } from '@src/utils'
import React, { useCallback, useEffect } from 'react'
import useStore, { dispatchSelector } from '../store'
import Cell from './cell'
import { navHeight } from './tabs'

interface Props {
  id: string
  index: number
  activeTab: string
}

export default function Tab({ id, index, activeTab }: Props) {
  const dispatch = useStore(dispatchSelector)
  const cellIds = useStore(useCallback(state => state.tabs[id].cells, [id]))
  const activeCell = useStore(
    useCallback(state => state.cells[state.tabs[id].activeCell], [id]),
  )

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
    <>
      <Flex
        className="no-drag"
        css={{
          width: '$56',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor:
            id === activeTab ? '$focusedBackground' : '$background',
          overflow: 'hidden',
          opacity: id === activeTab ? 1 : 0.67,
          borderRight: '1px solid $accent',
          px: '$2',
        }}
        onClick={() => {
          dispatch({ type: 'focus-tab', id })
        }}
      >
        {cellIds.map((id, i) => (
          <Span
            key={id}
            css={{
              fontSize: '$xs',
              color: '$foreground',

              '& + &': {
                pl: '$2',
                ml: '$2',
                borderLeft: '1px solid $accent',
              },
            }}
          >
            <Path>{i}</Path>
          </Span>
        ))}
      </Flex>
      <Div
        css={{
          display: activeTab === id ? 'block' : 'none', // only show active tab
          position: 'absolute',
          height: `calc(100% - ${navHeight})`,
          width: '100%',
          top: navHeight,
          right: 0,
          bottom: 0,
          left: 0,
        }}
      >
        <Grid
          css={{
            height: '100%',
            gridAutoRows: 'minmax(0, 1fr)',
            rowGap: '$2',
          }}
        >
          {cellIds.map(id => (
            <Cell
              key={id}
              id={id}
              active={id === activeCell.id}
              showBorder={id === activeCell.id && cellIds.length > 1}
            />
          ))}
        </Grid>
      </Div>
    </>
  )
}
