import { type } from 'process'
import React, { useEffect, useRef, useState } from 'react'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import {
  CellType,
  CellTypeWithFocused,
  FrontendMessage,
  ServerDataMessage,
  ServerStatusMessage,
} from '../../types'
import { ipc, useListener } from '../lib'
import { theme } from '../stitches.config'
import useStore from '../store'
import List from './custom/list'
import Prompt from './prompt'
import { Div } from './shared'

const Cell: React.FC<CellTypeWithFocused> = cell => {
  const dispatch = useStore(state => state.dispatch)
  const { id } = cell

  console.log('cell', cell)

  useListener(
    `status-${id}`,
    ({ type, status }: ServerStatusMessage) => {
      dispatch({ type: 'set-cell', id, cell: { type, status } })
    },
    [],
  )

  return (
    <Div
      onFocus={() => {
        dispatch({ type: 'focus', id })
      }}
    >
      <Prompt {...cell} />
      <Div css={{ p: '$2' }}>
        {cell.type === 'PTY' && <PtyRenderer {...cell} />}
        {cell.type === 'API' && <ApiRenderer {...cell} />}
      </Div>
    </Div>
  )
}

export default Cell

const ApiRenderer: React.FC<CellType> = ({ id, currentDir, input }) => {
  const dispatch = useStore(state => state.dispatch)
  const [output, setOutput] = useState('')

  // todo: sometimes we miss data because this approach is too slow
  useListener(
    `data-${id}`,
    (message: ServerDataMessage) => {
      console.log('parsing')

      const data = JSON.parse(message.data)

      // handle built-in stuff
      if (data.cd) {
        dispatch({ type: 'set-cell', id, cell: { currentDir: data.cd } })
      }

      setOutput(data.output)
    },
    [],
  )

  switch (input) {
    // check if custom renderer is available
    case 'list':
      return <List path={currentDir} />
    default:
      // default to auto renderer (markdown?)
      return <div>{output}</div>
  }
}

const PtyRenderer: React.FC<CellType> = ({ id, currentDir, input, status }) => {
  const ref = useRef<HTMLDivElement>(null)
  const terminalRef = useRef<Terminal | null>(null)

  useEffect(() => {
    if (!ref.current) return

    let term = new Terminal({
      cursorStyle: 'block',
      fontFamily: theme.fonts.$mono,
      theme: {
        foreground: theme.colors.$primaryTextColor,
        background: theme.colors.$tileBackgroundColor,
        selection: theme.colors.$selectionColor, // color looks lighter in xterm, idk why
        cursor: theme.colors.$accentColor,
      },
    })

    // todo: https://xtermjs.org/docs/guides/flowcontrol/
    term.onKey(({ key, domEvent }) => {
      if (domEvent.ctrlKey && domEvent.key === 'Tab') {
        terminalRef.current?.blur()
      } else if (!term.getOption('disableStdin')) {
        console.log('key', key.charCodeAt(0))

        const message: FrontendMessage = {
          type: 'send-stdin',
          data: { id, key },
        }
        ipc.send('message', message)
      }
    })

    // fit
    const fitAddon = new FitAddon()
    term.loadAddon(fitAddon)
    fitAddon.fit()

    term.open(ref.current)
    terminalRef.current = term

    // messes up focus
    const xtermFocusElement = ref.current?.children[0] as HTMLDivElement
    if (xtermFocusElement) {
      xtermFocusElement.tabIndex = -1
    }
  }, [currentDir, id])

  useEffect(() => {
    // todo: reset when re running a cell
    console.log('status', status)

    // over
    if (status === 'exited' || status === 'error') {
      // hide cursor
      terminalRef.current?.write('\u001B[?25l')

      // disable stdin
      terminalRef.current?.setOption('disableStdin', true)

      terminalRef.current?.blur()
    }
  }, [status])

  useListener(
    `data-${id}`,
    (message: ServerDataMessage) => {
      if (!terminalRef.current) {
        console.warn('Terminal not available')
        return
      }

      console.log('writing chunk', message.data)
      terminalRef.current.write(message.data)
    },
    [],
  )

  return (
    <Div
      ref={ref}
      onFocus={e => {
        if (status === 'exited' || status === 'error') {
          terminalRef.current?.blur()
          return
        }
        terminalRef.current?.focus()
      }}
    />
  )
}
