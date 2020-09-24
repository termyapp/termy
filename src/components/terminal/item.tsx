import React, { useEffect, useRef } from 'react'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { Command } from '../../interfaces'
import { getCurrentDir, useListener } from '../../lib'
import getCommandType from '../../lib/get-command-type'
import { emit } from '../../lib/tauri'
import { styled } from '../../stitches.config'
import Column from '../custom/view'

const WithPrompt: React.FC<{ dir: string; input: string }> = ({
  dir,
  input,
  children,
}) => (
  <div>
    <Prompt>
      <CurrentDir>{dir}</CurrentDir>
      {/* todo: use readonly prompt */}
      <span>{input}</span>
    </Prompt>
    {children}
  </div>
)

const Prompt = styled('div', {
  background: '$gray200',
  borderRadius: '$2',
  px: '$3',
  py: '$2',
  my: '$3',
  borderColor: '$gray400',
  border: '1px solid',
})

const CurrentDir = styled('span', {
  color: '$gray700',
  fontWeight: 'bold',
  mr: '$2',
  fontSize: '$2',
  textDecoration: 'underline',
})

const DefaultItem: React.FC<Command> = ({ id, currentDir, input }) => {
  const termRef = useRef<null | Terminal>(null)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!ref.current) return
    const term = new Terminal({
      convertEol: true,
      cursorStyle: 'bar',
      // allowTransparency: true, // this can negatively affect performance
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

  return (
    <div
      tabIndex={0}
      ref={ref}
      style={{ background: 'red', height: '408px' }}
    ></div>
  )
}

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

  return (
    <WithPrompt dir={getCurrentDir(command.currentDir)} input={command.input}>
      {type === 'default' ? (
        <DefaultItem {...command} />
      ) : (
        <Wrapper>
          <CustomItem {...command} />
        </Wrapper>
      )}
    </WithPrompt>
  )
}

const Wrapper = styled('div', {
  overflowY: 'hidden',
  height: '20rem',
  width: '100%',
  borderColor: '$gray300',
  border: '1px solid',
  borderRadius: '$2',
})

export default Item
