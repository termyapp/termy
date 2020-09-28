import React, { useEffect, useRef } from 'react'
import { useKey } from 'react-use'
import { getCurrentDir } from '../../lib'
import { styled } from '../../stitches.config'
import useStore from '../../store'
import Bar from './bar'
import Item from './item'
import Prompt, { getInput } from './prompt'

// const ShortcutButton: React.FC = () => {
//   const [pressed, setPressed] = useState(false)
//   return (
//     <Button
//       pressed={pressed}
//       onKeyDown={() => {
//         if (!pressed) {
//           setPressed(true)
//         }
//       }}
//       onKeyUp={() => setPressed(false)}
//       tabIndex={0}
//     >
//       Button
//     </Button>
//   )
// }

// const Button = styled.div<{ pressed: boolean }>`
//   background: ${({ theme, pressed }) =>
//     pressed ? theme.colors.accents[3] : theme.colors.accents[1]};
//   transition: all 0.1s ease;
// `

const Terminal: React.FC = () => {
  const { history, currentDir, setCurrentDir } = useStore()
  const mainRef = useRef<HTMLDivElement>(null)
  console.log('history', history)

  useKey('Escape', () => getInput()?.focus())

  useEffect(() => {
    setTimeout(() => {
      getInput()?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }, 150)
  }, [history.length])

  return (
    <Grid>
      <Main ref={mainRef} id="m1">
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
