import { Div } from '@components'
import { useListener, useXterm } from '@hooks'
import { styled } from '@src/stitches.config'
import useStore, { dispatchSelector } from '@src/store'
import type { CellWithActive, ServerMessage, ThemeMode } from '@types'
import React, { useEffect, useState } from 'react'
import Mdx from './mdx'

export default function Output(cell: CellWithActive) {
  const dispatch = useStore(dispatchSelector)
  const { id, type, status } = cell

  // mdx
  const [mdx, setMdx] = useState('')

  // pty
  const { terminalContainerRef, terminalRef } = useXterm(cell)

  useListener(
    id,
    (_, message: ServerMessage) => {
      console.debug('RECEIVED', message)
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
            if (type !== 'text') {
              dispatch({ type: 'set-cell', id, cell: { type: 'text' } })
            }

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
                  case 'pretty_path': {
                    dispatch({
                      type: 'set-cell',
                      id,
                      cell: { prettyPath: actionValue },
                    })
                    break
                  }
                  case 'branch': {
                    dispatch({
                      type: 'set-cell',
                      id,
                      cell: { branch: actionValue },
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
    [id, type, dispatch],
  )

  const focusMdx = () => {} // todo: focus

  // focus output after running the cell
  useEffect(() => {
    if (status === 'running') {
      if (type === 'text') {
        terminalRef.current?.focus()
      } else {
        focusMdx()
      }
    }
  }, [status, type])

  return (
    <Wrapper
      id={`output-${id}`}
      tabIndex={-1} // make it focusable
      onFocus={() =>
        type === 'text' ? terminalRef.current?.focus() : focusMdx()
      }
    >
      <Pty show={type === 'text'}>
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
          display: type === 'mdx' ? 'block' : 'none',
          fontSize: '$sm',
          color: '$secondaryTextColor',
        }}
      >
        <Mdx>{mdx}</Mdx>
      </Div>
    </Wrapper>
  )
}

const Wrapper = styled(Div, {
  position: 'relative',
  px: '$2',
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
