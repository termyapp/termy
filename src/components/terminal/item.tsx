import React, { useEffect, useRef, useState } from 'react'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { Message } from '../../../types'
import { Command } from '../../interfaces'
import { getCurrentDir, useListener } from '../../lib'
import getCommandType from '../../lib/get-command-type'
import { ipcRenderer } from '../../lib/ipc'
import { styled } from '../../stitches.config'
import List from '../custom/list'

const DefaultItem: React.FC<Command> = ({ id, currentDir, input }) => {
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

      const message: Message = { type: 'STDIN', data: { id, key } }
      console.log(ipcRenderer.sendSync('message', message))
    })

    // fit
    const fitAddon = new FitAddon()
    term.loadAddon(fitAddon)
    fitAddon.fit()

    term.open(ref.current)

    setTerminal(term)
  }, [currentDir, id])

  useListener(
    id,
    payload => {
      if (!terminal) return

      if (typeof payload.chunk !== 'undefined') {
        console.log('writing chunk', payload)
        terminal.write(payload.chunk)
      } else {
        console.log('Exit status: ', payload.exitStatus)
        setExitStatus(payload.exitStatus)

        terminal.write('\u001B[?25l') // hide cursor
        terminal.setOption('disableStdin', true)
      }
    },
    [],
  )

  return <Xterm tabIndex={0} ref={ref}></Xterm>
}

const Xterm = styled.div({ px: '$2' })

const CustomItem = ({ id, currentDir, input }: Command) => {
  if (input.startsWith('cd')) {
    return <div>Changed directory!</div>
  }

  switch (input) {
    case 'ls':
      return <List path={currentDir} />
    default:
      throw new Error('No case for: ' + input)
  }
}

const Item: React.FC<Command> = command => {
  const type = getCommandType(command.input)
  const dir = getCurrentDir(command.currentDir)

  return (
    <Container>
      <Prompt>
        <CurrentDir>{dir}</CurrentDir>
        {/* todo: use readonly prompt */}
        <span>{command.input}</span>
      </Prompt>
      {type === 'default' ? (
        <DefaultItem {...command} />
      ) : (
        <CustomItem {...command} />
      )}
    </Container>
  )
}

const Container = styled('div', {
  my: '$3',
  // border: '1px solid $gray300',
  br: '$3',

  ':focus-within': {
    border: '1px solid $gray400',
    background: '$gray200',
  },
})

const Prompt = styled('div', {
  px: '$3',
  py: '$2',
})

const CurrentDir = styled('span', {
  color: '$blue400',
  fontWeight: '600',
  mr: '$2',
  fontSize: '$3',
  borderBottom: '3px solid $blue300',
})

export default Item
