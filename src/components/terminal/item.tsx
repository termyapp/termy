import React, { useEffect, useRef } from 'react'
import { Terminal } from 'xterm'
import { Command } from '../../interfaces'
import { getCurrentDir, useListener } from '../../lib'
import getCommandType from '../../lib/get-command-type'
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
  const events = useListener(id)
  const termRef = useRef<null | Terminal>(null)
  const ref = useRef<HTMLDivElement>(null)
  console.log('events', events)
  useEffect(() => {
    if (!ref.current) return
    termRef.current = new Terminal()
    termRef.current.open(ref.current)
  }, [])

  useEffect(() => {
    const term = termRef.current
    console.log(term)

    if (!term || events.length < 1) return
    console.log('writing', events[events.length - 1].stdout)
    term.write(events[events.length - 1].stdout)
  }, [events])

  return <div ref={ref} style={{ background: 'red', height: '20rem' }}></div>
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
