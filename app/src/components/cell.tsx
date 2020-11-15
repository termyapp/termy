import React, { useCallback, useState } from 'react'
import type { CellType } from '../../types'
import { useListener, useXterm } from '../lib'
import { styled } from '../stitches.config'
import useStore from '../store'
import Prompt from './prompt'
import { Card, Div } from './shared'

const Cell: React.FC<Pick<CellType, 'id'>> = ({ id }) => {
  const cell = useStore(useCallback(state => state.cells[id], [id]))
  const dispatch = useStore(state => state.dispatch)
  const [focused, setFocused] = useState(true)

  // api
  const [output, setOutput] = useState('')

  // pty
  const { terminalContainerRef, terminalRef } = useXterm({ ...cell, focused })

  useListener(`message-${id}`, (_, message) => {
    console.log('received', message)
    const { output, status } = message

    if (status) {
      dispatch({ type: 'set-cell', id, cell: { status } })
    }

    if (output) {
      dispatch({ type: 'set-cell', id, cell: { type: output.type } })

      if (output.type === 'api') {
        // handle built-in stuff
        if (output.cd) {
          dispatch({ type: 'set-cell', id, cell: { currentDir: output.cd } })
        }

        setOutput(output.data)
      } else if (output.type === 'pty') {
        terminalRef.current?.write(output.data)
        // console.log('writing chunk', output.data)
      }
    }
  })

  return (
    <Wrapper onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}>
      <Prompt {...cell} focused={focused} />
      <Pty show={cell.type === 'pty'}>
        <Div
          ref={terminalContainerRef}
          css={{
            position: 'absolute',
            width: '100%',
            height: '100%',
          }}
        />
      </Pty>
      <Div
        css={{
          display: cell.type === 'api' ? 'initial' : 'none',
          fontSize: '$sm',
          color: '$secondaryTextColor',
        }}
      >
        {output}
      </Div>
    </Wrapper>
  )
}

export default Cell

const Wrapper = styled(Card, {
  height: '100%',
  py: '$2',
  px: '$4',

  backgroundColor: '$focusedBackgroundColor',
  border: '1px solid transparent',
  color: '$secondaryTextColor',

  ':focus-within': {
    border: '1px solid $accentColor',
    backgroundColor: '$focusedBackgroundColor',
    color: '$primaryTextColor',
  },
})

const Pty = styled(Div, {
  variants: {
    show: {
      true: {
        mt: '$2',
        position: 'relative',
        height: 300, // todo: variable cell size (auto on new line?)
        visibility: 'visible',
      },
      false: {
        visibility: 'hidden',
      },
    },
  },
})
