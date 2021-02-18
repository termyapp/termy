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

const Cell: React.FC<{ id: string; active: boolean; showBorder: boolean }> = ({
  id,
  active,
  showBorder,
}) => {
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
    <Container
      onFocus={() => dispatch({ type: 'focus-cell', id })}
      active={active}
      showBorder={showBorder}
    >
      <Prompt {...cell} active={active} />
      <Output {...cell} active={active} />
    </Container>
  )
}

export default Cell

const Container = styled(Flex, {
  position: 'relative',
  borderRadius: '$sm',
  flexDirection: 'column',

  variants: {
    active: {
      true: {
        color: '$focusedForeground',
        borderRadius: '$md',
      },
    },
    showBorder: {
      true: {
        border: '1px solid $accent',
      },
      false: {
        border: '1px solid transparent',
      },
    },
  },
})
