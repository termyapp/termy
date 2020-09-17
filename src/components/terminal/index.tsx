import React, { useEffect } from 'react'
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

  useEffect(() => {
    const input = getInput()
    if (input) {
      input.scrollIntoView({ behavior: 'smooth' })
    }
    console.log('history', history)
  }, [history])

  return (
    <Grid>
      <Main>
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

const Commands = styled('div', {})

export default Terminal
