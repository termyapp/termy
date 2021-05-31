import { useListener, useXterm } from '@hooks'
import useStore, { dispatchSelector } from '@src/store'
import { Div, styled } from '@termy/ui'
import type { CellWithActive, Component, NativeMessage, Themes } from '@types'
import React, { useEffect, useState } from 'react'
import GUI from './gui'

export default function Output(cell: CellWithActive) {
  const { id, type, status } = cell
  const dispatch = useStore(dispatchSelector)
  const { terminalContainerRef, terminalRef } = useXterm(cell)
  const [gui, setGui] = useState<Component | null>(null)

  useListener(
    id,
    (_, messages: NativeMessage[]) => {
      console.debug('RECEIVED', messages)

      const handleMessage = (message: NativeMessage) => {
        console.log('Handling message:', message)

        for (const [key, value] of Object.entries(message)) {
          switch (key) {
            case 'status': {
              dispatch({ type: 'set-cell', id, cell: { status: value } })
              break
            }
            case 'component': {
              if (type !== 'gui') dispatch({ type: 'set-cell', id, cell: { type: 'gui' } })

              setGui(value)
              break
            }
            case 'tui': {
              if (type !== 'tui') dispatch({ type: 'set-cell', id, cell: { type: 'tui' } })

              const chunk = new Uint8Array(value)
              terminalRef.current?.write(chunk, () => {
                // we pause immediately in external.rs
                dispatch({ type: 'resume-cell', id })
              })
              break
            }
            case 'action': {
              for (const [k, v] of Object.entries(value)) {
                switch (k) {
                  case 'cd': {
                    dispatch({
                      type: 'set-cell',
                      id,
                      cell: { currentDir: v as string },
                    })
                    break
                  }
                  case 'theme': {
                    dispatch({
                      type: 'set-theme',
                      theme: v as Themes,
                    })
                    break
                  }
                  default: {
                    console.error('Invalid action:', value)
                  }
                }
              }
              break
            }
            default: {
              console.error('Invalid message:', message)
            }
          }
        }
      }

      for (const message of messages) {
        handleMessage(message)
      }
    },
    [id, type, dispatch],
  )

  const focusGui = () => {} // todo: focus

  // focus output after running the cell
  useEffect(() => {
    if (status === 'running') {
      if (type === 'tui') {
        terminalRef.current?.focus()
      } else {
        focusGui()
      }
    }
  }, [status, type])

  return (
    <Wrapper
      id={`output-${id}`}
      tabIndex={-1} // make it focusable
      onFocus={() => (type === 'tui' ? terminalRef.current?.focus() : focusGui())}
    >
      <Pty show={type === 'tui'}>
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
          display: type === 'gui' ? 'block' : 'none',
          fontSize: '$sm',
          color: '$secondaryTextColor',
        }}
      >
        {gui && <GUI {...gui} />}
      </Div>
    </Wrapper>
  )
}

const Wrapper = styled('div', {
  position: 'relative',
  px: '$2',
  py: '$1',
  height: '100%',
  overflowY: 'auto',
})

const Pty = styled('div', {
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
