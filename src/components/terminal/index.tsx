import React, { useEffect, useRef } from 'react'
import { useKey } from 'react-use'
import { getCurrentDir } from '../../lib'
import { styled } from '../../stitches.config'
import useStore from '../../store'
import Bar from './bar'
import Item from './item'
import Prompt, { getPrompt } from './prompt'

// @ts-ignore
console.log(window.ipcRenderer.sendSync('synchronous-message', 'ping')) // prints "pong"

const Terminal: React.FC = () => {
  const { history, currentDir, setCurrentDir } = useStore()
  const mainRef = useRef<HTMLDivElement>(null)
  console.log('history', history)

  useKey('Escape', () => getPrompt()?.focus())

  useEffect(() => {
    setTimeout(() => {
      getPrompt()?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }, 150)
  }, [history.length])

  return (
    <Grid>
      <Main ref={mainRef}>
        <Commands>
          {history.map((command, i) => (
            <Item key={command.id} {...command} />
          ))}
        </Commands>
        <Prompt currentDir={currentDir} setCurrentDir={setCurrentDir} />
      </Main>
      <Bar currentDir={getCurrentDir(currentDir)} />
    </Grid>
  )
}

const Grid = styled('div', {
  position: 'relative',
  overflow: 'hidden',
  height: '100vh',
  display: 'grid',
  gridTemplateRows: '1fr auto',
})

const Main = styled('div', {
  overflowY: 'auto',
  display: 'grid',
  gridTemplateRows: '1fr auto',
  px: '$2',
})

const Commands = styled('div', {
  overflow: 'hidden',
  height: '100%',
})

export default Terminal
