import { Div } from '@components'
import { useListener, useXterm } from '@hooks'
import { styled } from '@src/stitches.config'
import useStore from '@src/store'
import type { ICellWithActive, ServerMessage, ThemeMode } from '@types'
import React, { useState } from 'react'
import Mdx from './mdx'

const Output: React.FC<ICellWithActive> = cell => {
  const dispatch = useStore(state => state.dispatch)
  const { id } = cell

  // mdx
  const [mdx, setMdx] = useState('')

  // pty
  const { terminalContainerRef, terminalRef } = useXterm(cell)

  useListener(
    `message-${id}`,
    (_, message: ServerMessage) => {
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
            if (cell.type !== 'text')
              dispatch({ type: 'set-cell', id, cell: { type: 'text' } })
            const chunk = new Uint8Array(value)
            terminalRef.current?.write(chunk, () => {
              // we pause immediately in external.rs
              dispatch({ type: 'resume-cell', id })
            })
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
                    break
                  }
                  case 'theme': {
                    dispatch({
                      type: 'set-theme',
                      theme: actionValue as ThemeMode,
                    })
                    break
                  }
                }
              })
            }

            break
        }
      }
    },
    [cell.type],
  )

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
