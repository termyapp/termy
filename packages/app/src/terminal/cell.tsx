import useStore, { dispatchSelector } from '@src/store'
import React, { useCallback, useEffect } from 'react'
import { Cell as Container } from '@termy/ui'
import Output from './output'
import Prompt from './prompt'

interface Props {
  id: string
  active: boolean
  showBorder: boolean
}

export default function Cell({ id, active, showBorder }: Props) {
  const cell = useStore(useCallback(state => state.cells[id], [id]))
  const dispatch = useStore(dispatchSelector)

  useEffect(() => {
    // kill on onMount
    return () => {
      dispatch({ type: 'kill-cell', id })
    }
  }, [id])

  return (
    <Container
      id={id}
      onFocus={() => dispatch({ type: 'focus-cell', id })}
      active={active}
      showBorder={showBorder}
    >
      <Prompt {...cell} active={active} />
      <Output {...cell} active={active} />
    </Container>
  )
}
