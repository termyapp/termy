import React, { useCallback, useEffect } from 'react'
import shallow from 'zustand/shallow'
import { Flex } from '../components'
import { styled } from '../stitches.config'
import useStore from '../store'
import Output from './output'
import Prompt from './prompt'

interface Props {
  id: string
  active: boolean
  showBorder: boolean
}

export default function Cell({ id, active, showBorder }: Props) {
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
      onMouseEnter={() => dispatch({ type: 'focus-cell', id })}
      onFocus={() => dispatch({ type: 'focus-cell', id })}
      active={active}
      showBorder={showBorder}
    >
      <Prompt {...cell} active={active} />
      <Output {...cell} active={active} />
    </Container>
  )
}

const Container = styled(Flex, {
  position: 'relative',
  borderRadius: '$md',
  flexDirection: 'column',

  variants: {
    active: {
      true: {
        color: '$focusedForeground',
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