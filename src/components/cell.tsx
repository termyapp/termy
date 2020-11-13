import React, { useState } from 'react'
import { CellTypeWithFocused, OutputType } from '../../types'
import { useListener, useXterm } from '../lib'
import useStore from '../store'
import Prompt from './prompt'
import { Div } from './shared'

const Cell: React.FC<CellTypeWithFocused> = cell => {
  const { id } = cell
  const dispatch = useStore(state => state.dispatch)
  // api
  const [output, setOutput] = useState('')

  // pty
  const { terminalContainerRef, terminalRef } = useXterm(cell)

  useListener(`message-${id}`, (_, message) => {
    console.log('received', message)
    const { output, status } = message
    if (status) {
      dispatch({ type: 'set-cell', id, cell: { status } })
    }

    if (output) {
      dispatch({ type: 'set-cell', id, cell: { type: output.type } })
      if (output.type === 'api') {
        console.log('parsing')

        // handle built-in stuff
        if (output.cd) {
          dispatch({ type: 'set-cell', id, cell: { currentDir: output.cd } })
        }

        setOutput(output.data)
      } else if (output.type === 'pty') {
        terminalRef.current?.write(output.data)
        console.log('terminalRef.current', !!terminalRef.current)
        console.log('writing chunk', output.data)
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

      <Div
        css={{
          mt: '$2',
          position: 'relative',
          height: cell.type === 'pty' ? 300 : 0, // todo: variable cell size (auto on new line?)
          visibility: cell.type === 'pty' ? 'visible' : 'hidden',
        }}
      >
        <Div
          id={`cell-${cell.id}`}
          ref={terminalContainerRef}
          style={{}}
          css={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backgroundColor: 'red',
          }}
          // onFocus={() => {
          //   if (cell.status === 'success' || cell.status === 'error') {
          //     terminalRef.current?.blur()
          //     return
          //   }
          //   terminalRef.current?.focus()
          // }}
        />
      </Div>
      {/* <Div
        css={{
          // display: type === 'api' ? 'initial' : 'none',
          fontSize: '$sm',
          color: '$secondaryTextColor',
        }}
      >
        {output}
      </Div> */}
    </Div>
  )
}

export default Cell
