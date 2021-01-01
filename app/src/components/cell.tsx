import React, { useCallback, useEffect, useState } from 'react'
import type { CellType, ServerMessage, ThemeMode } from '../../types'
import { useListener, useXterm } from '../lib'
import { styled } from '../stitches.config'
import useStore, { focusCell } from '../store'
import Mdx from './mdx'
import Prompt from './prompt'
import { Div, Flex } from './shared'

const Cell: React.FC<Pick<CellType, 'id' | 'focused'>> = ({ id, focused }) => {
  const cell = useStore(useCallback(state => state.cells[id], [id]))
  const dispatch = useStore(state => state.dispatch)

  // mdx
  const [output, setOutput] = useState('')

  // pty
  const { terminalContainerRef, terminalRef } = useXterm({ ...cell, focused })

  useListener(`message-${id}`, (_, message: ServerMessage) => {
    console.log('received', message)
    for (const [key, value] of Object.entries(message)) {
      switch (key) {
        case 'error': {
          console.error(message.error)
          break
        }
        case 'status': {
          dispatch({ type: 'set-cell', id, cell: { status: value } })
          break
        }
        case 'text': {
          dispatch({ type: 'set-cell', id, cell: { type: 'text' } })
          terminalRef.current?.write(new Uint8Array(value))
          // console.log('writing chunk', output.data)
          break
        }
        case 'mdx': {
          dispatch({ type: 'set-cell', id, cell: { type: 'mdx' } })
          setOutput(value)
          break
        }
        case 'api': {
          break
        }
        case 'action':
          {
            if (!message.action) return
            // handle internal stuff

            message.action.forEach(([actionKey, actionValue]) => {
              switch (actionKey) {
                case 'cd': {
                  dispatch({
                    type: 'set-cell',
                    id,
                    cell: { currentDir: actionValue },
                  })
                }
                case 'theme': {
                  dispatch({
                    type: 'set-theme',
                    theme: actionValue as ThemeMode,
                  })
                }
              }
            })
          }

          break
      }
    }
  })

  useEffect(() => {
    if (focused && cell.status !== 'running') {
      focusCell(id)
    }
  }, [focused, cell.status])

  useEffect(() => {
    if (cell.value === 'shortcuts')
      dispatch({ type: 'run-cell', id, input: cell.value })
  }, [])

  // it only breaks after we remove the first cell
  if (typeof cell === 'undefined') return null

  return (
    <Card onFocus={() => dispatch({ type: 'focus', id })} focused={focused}>
      <Prompt {...cell} focused={focused} />
      <Output>
        <Pty show={cell.type === 'text'}>
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
            display: cell.type === 'mdx' ? 'block' : 'none',
            fontSize: '$sm',
            color: '$secondaryTextColor',
          }}
        >
          <Mdx>{output}</Mdx>
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
  border: '1px solid transparent',

  variants: {
    focused: {
      true: {
        backgroundColor: '$focusedBackground',
        color: '$focusedForeground',
        border: '1px solid $accent',
      },
    },
  },
})

const Output = styled(Div, {
  px: '$4',
  py: '$1',
  height: '100%',
  overflowY: 'auto',
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
