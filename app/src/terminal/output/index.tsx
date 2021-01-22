import { styled } from '@src/stitches.config'
import React, { useCallback, useEffect, useState } from 'react'
import type { CellType, ServerMessage, ThemeMode } from '../../../types'
import { Div } from '../../components'
import useStore from '../../store'
import { useListener } from '../../utils'
import Mdx from './mdx'
import { useXterm } from './xterm'

const Output: React.FC<Pick<CellType, 'id' | 'focused'>> = ({
  id,
  focused,
}) => {
  const cell = useStore(useCallback(state => state.cells[id], [id]))
  const dispatch = useStore(state => state.dispatch)

  // mdx
  const [mdx, setMdx] = useState('')

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
          setMdx(value)
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
    if (cell.value === 'shortcuts')
      dispatch({ type: 'run-cell', id, input: cell.value })
  }, [])

  // it only breaks after we remove the first cell
  if (typeof cell === 'undefined') return null

  return (
    <Wrapper>
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
        <Mdx>{mdx}</Mdx>
      </Div>
    </Wrapper>
  )
}

export default Output

const Wrapper = styled(Div, {
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
