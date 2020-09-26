import React, { useEffect, useRef } from 'react'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { Command } from '../../interfaces'
import { getCurrentDir, useListener } from '../../lib'
import getCommandType from '../../lib/get-command-type'
import { emit } from '../../lib/tauri'
import { styled } from '../../stitches.config'
import Column from '../custom/view'

const DefaultItem: React.FC<Command> = ({ id, currentDir, input }) => {
  const termRef = useRef<null | Terminal>(null)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!ref.current) return
    const term = new Terminal({
      convertEol: true,
      cursorStyle: 'block',
      allowTransparency: true, // this can negatively affect performance
      theme: {
        background: 'rgba(0,0,0,0)',
      },
    })

    term.onKey(({ key, domEvent }) => {
      console.log('onKey', key)
      console.log(domEvent)

      switch (domEvent.key) {
        case 'Enter':
          key = '\r\n'
          break
      }

      emit(
        'event',
        JSON.stringify({ id, eventType: 'STDIN', input: key, currentDir }),
      )
      term.write(key)
    })

    // fit
    const fitAddon = new FitAddon()
    term.loadAddon(fitAddon)
    fitAddon.fit()

    term.open(ref.current)
    termRef.current = term
  }, [])

  useListener(
    id,
    payload => {
      const term = termRef.current
      if (!term) return
      // console.log('writing chunk', payload.id)
      term.write(payload.chunk)
    },
    [],
  )

  return <Xterm tabIndex={0} ref={ref}></Xterm>
}

const Xterm = styled.div({ px: '$2', height: '100%' })

const CustomItem = ({ id, currentDir, input }: Command) => {
  if (input.startsWith('cd')) {
    return <div>Changed directory!</div>
  }

  switch (input) {
    case 'ls':
      return <Column path={currentDir} />
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
        <Wrapper>
          <CustomItem {...command} />
        </Wrapper>
      )}
    </Container>
  )
}

const Container = styled('div', {
  overflow: 'hidden',
  my: '$3',
  background: '$gray100',
  border: '1px solid $gray300',
  br: '$3',
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

const Wrapper = styled('div', {
  height: '20rem',
  width: '100%',
})

export default Item
