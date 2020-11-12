import React, { useState } from 'react'
import { CellTypeWithFocused, OutputType, Message } from '../../types'
import { useListener, useXterm } from '../lib'
import useStore from '../store'
import Prompt from './prompt'
import { Div } from './shared'

const Cell: React.FC<CellTypeWithFocused> = cell => {
  const { id } = cell
  const dispatch = useStore(state => state.dispatch)
  // api
  const [output, setOutput] = useState('')
  const [type, setType] = useState<OutputType>(null)

  // pty
  const { terminalContainerRef, terminalRef } = useXterm({ ...cell, type })

  useListener(`message-${id}`, (_, message) => {
    console.log('Received', message)
    const { output, status } = message
    if (status) {
      dispatch({ type: 'set-cell', id, cell: { status } })
    }

    if (output) {
      setType(output.type)
      if (output.type === 'api') {
        console.log('parsing')

        // handle built-in stuff
        if (output.cd) {
          dispatch({ type: 'set-cell', id, cell: { currentDir: output.cd } })
        }

        setOutput(output.data)
      } else if (output.type === 'pty') {
        if (!terminalRef.current) {
          console.warn('Terminal not available')
          return
        }
        console.log('writing chunk', output.data)
        terminalRef.current.write(output.data)
      }
    }
  })

  return (
    <Div
      onFocus={() => dispatch({ type: 'focus', id })}
      onBlur={() => dispatch({ type: 'focus', id: null })}
      css={{
        p: '$2',
      }}
    >
      <Prompt {...cell} />

      <Div css={{ mt: '$2' }}>
        <Div
          ref={terminalContainerRef}
          // todo: on resize, send new row, col to shell pty
          css={{
            width: terminalContainerRef.current?.parentElement?.clientWidth,
            height: type === 'pty' ? 300 : 0,
          }}
          onFocus={() => {
            if (cell.status === 'success' || cell.status === 'error') {
              terminalRef.current?.blur()
              return
            }
            terminalRef.current?.focus()
          }}
        />
      </Div>
      <Div
        css={{
          // display: type === 'api' ? 'initial' : 'none',
          fontSize: '$sm',
          color: '$secondaryTextColor',
        }}
      >
        {output}
      </Div>
    </Div>
  )
}

export default Cell
