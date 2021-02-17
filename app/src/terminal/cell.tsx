import React, { useCallback, useEffect } from 'react'
import shallow from 'zustand/shallow'
import { Flex } from '../components'
import { styled } from '../stitches.config'
import useStore from '../store'
import Output from './output'
import Prompt from './prompt'

export const focusCell = (id: string) => {
  const cell = document.getElementById(id)
  if (cell) {
    cell.focus()
  }
}

const Cell: React.FC<{ id: string; active: boolean }> = ({ id, active }) => {
  const cell = useStore(
    useCallback(state => state.cells[id], [id]),
    shallow,
  )
  const dispatch = useStore(state => state.dispatch)

  // run initial cell on mount
  useEffect(() => {
    if (cell.value === 'shortcuts') dispatch({ type: 'run-cell', id })

    // kill on onmount
    return () => {
      dispatch({ type: 'kill-cell', id })
    }
  }, [id])

  return (
    <Card onFocus={() => dispatch({ type: 'focus-cell', id })} active={active}>
      <Prompt {...cell} active={active} />
      <Output {...cell} active={active} />
    </Card>
  )
}

export default Cell

const Card = styled(Flex, {
  position: 'relative',
  borderRadius: '$sm',
  flexDirection: 'column',
  border: '1px solid transparent',

  variants: {
    active: {
      true: {
        color: '$focusedForeground',
        border: '1px solid $accent',
        borderRadius: '$md',
      },
    },
  },
})
