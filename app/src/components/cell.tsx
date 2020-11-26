import React, { useCallback, useState } from 'react'
import type { CellType, ServerMessage, ThemeMode } from '../../types'
import { useListener, useXterm } from '../lib'
import { styled } from '../stitches.config'
import useStore from '../store'
import Api from './api'
import Prompt from './prompt'
import { Div, Flex } from './shared'

// it breaks nowadays, idk why
if (import.meta.hot) {
  import.meta.hot.decline()
}

const Cell: React.FC<Pick<CellType, 'id'>> = ({ id }) => {
  const cell = useStore(useCallback(state => state.cells[id], [id]))
  const dispatch = useStore(state => state.dispatch)
  const [focused, setFocused] = useState(true)

  // api
  const [output, setOutput] = useState('')

  // pty
  const { terminalContainerRef, terminalRef } = useXterm({ ...cell, focused })

  useListener(`message-${id}`, (_, message: ServerMessage) => {
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

        if (output.theme) {
          dispatch({ type: 'set-theme', theme: output.theme as ThemeMode })
        }

        setOutput(output.data.apiData)
      } else if (output.type === 'pty') {
        terminalRef.current?.write(new Uint8Array(output.data.ptyData))
        // console.log('writing chunk', output.data)
      }
    }
  })

  return (
    <Card
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onKeyDown={e => {
        if (focused && e.metaKey && e.key == 'w') {
          e.preventDefault()
          dispatch({ type: 'remove', id })
        }
      }}
    >
      <Prompt {...cell} focused={focused} />
      <Output>
        <Pty show={cell.type === 'pty'}>
          <Div
            ref={terminalContainerRef}
            css={{
              position: 'absolute',
              top: 0,
              left: 0,
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
          <Api>{output}</Api>
        </Div>
      </Output>
    </Card>
  )
}

export default Cell

const Card = styled(Flex, {
  position: 'relative',
  borderRadius: '$lg',
  flexDirection: 'column',

  color: '$defaultForeground',

  ':focus-within': {
    backgroundColor: '$defaultBackground',
  },
})

const Output = styled(Div, {
  p: '$4',
  height: '100%',
})

const Pty = styled(Div, {
  position: 'relative',

  variants: {
    show: {
      true: {
        width: '100%',
        height: '100%',
        visibility: 'visible',
      },
      false: {
        width: 0,
        height: 0,
        visibility: 'hidden',
      },
    },
  },
})
