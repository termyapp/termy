import React, { useEffect, useRef, useState } from 'react'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import {
  CellType,
  FrontendMessage,
  ServerDataMessage,
  ServerStatusMessage,
} from '../../../types'
import { ipc, useListener } from '../../lib'
import { styled } from '../../stitches.config'
import List from '../custom/list'
import Prompt from './prompt'

/**
 * 1. Render PTY/API based on type
 * 2. Show status
 *
 * Note: Listening for output happens in child components
 */
const Cell: React.FC<CellType> = cell => {
  console.log('cell: ', cell)
  const [status, setStatus] = useState<number | null>(null)
  const [type, setType] = useState<'PTY' | 'API' | null>(null)

  useListener(
    'status',
    cell.id,
    (message: ServerStatusMessage) => {
      setType(message.type)
      setStatus(message.status)
    },
    [],
  )

  return (
    <Container>
      <Prompt {...cell} />
      {type === 'PTY' && <PtyRenderer {...cell} />}
      {type === 'API' && <ApiRenderer {...cell} />}
    </Container>
  )
}

export default Cell

const Container = styled('div', {
  my: '$3',
  // border: '1px solid $gray300',
  br: '$3',

  ':focus-within': {
    border: '1px solid $gray400',
    background: '$gray200',
  },
})

const ApiRenderer: React.FC<CellType> = ({ id, currentDir, input }) => {
  switch (input) {
    // check if custom renderer is available
    case 'list':
      return <List path={currentDir} />
    default:
      // default to auto renderer (generate html)
      return <div>Auto Renderer</div>
  }
}

const PtyRenderer: React.FC<CellType> = ({ id, currentDir, input }) => {
  const ref = useRef<HTMLDivElement>(null)
  const [exitStatus, setExitStatus] = useState<null | number>(null)
  const [terminal, setTerminal] = useState<Terminal | null>(null)

  useEffect(() => {
    if (!ref.current) return
    let term = new Terminal({
      convertEol: true,
      cursorStyle: 'block',
      allowTransparency: true, // this can negatively affect performance
      theme: {
        background: 'rgba(0,0,0,0)',
      },
    })

    // todo: https://xtermjs.org/docs/guides/flowcontrol/
    term.onData(key => {
      console.log('key', key)

      const message: FrontendMessage = { type: 'send-stdin', data: { id, key } }
      ipc.send('message', message)
    })

    // fit
    const fitAddon = new FitAddon()
    term.loadAddon(fitAddon)
    fitAddon.fit()

    term.open(ref.current)

    setTerminal(term)
  }, [currentDir, id])

  useListener(
    'data',
    id,
    (message: ServerDataMessage) => {
      if (!terminal) return

      console.log('writing chunk', message.data)
      terminal.write(message.data)

      //   console.log('Exit status: ', message.exitStatus)
      //   setExitStatus(message.exitStatus)

      //   terminal.write('\u001B[?25l') // hide cursor
      //   terminal.setOption('disableStdin', true)
    },
    [],
  )

  return <XtermContainer tabIndex={0} ref={ref}></XtermContainer>
}

const XtermContainer = styled.div({ px: '$2' })
