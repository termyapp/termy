import React from 'react'
import { styled } from '../stitches.config'
import { Div } from './design-system'

const formatCurrentDir = (currentDir: string) => {
  const path = currentDir.split('/')
  if (path.length < 3) {
    return currentDir
  }
  const relativePath = currentDir.split('/').slice(3).join('/')
  return (relativePath.length > 0 ? '~/' : '~') + relativePath
}

const Prompt: React.FC<{ currentDir: string; input: string }> = ({
  currentDir,
  input,
}) => {
  return (
    <Wrapper
      newLine={currentDir.length > 60} // todo: do better with long lines (decrease fontSize)
    >
      <CurrentDir>{formatCurrentDir(currentDir)}</CurrentDir>
      <Div
        css={{
          width: '100%',
          py: '$2',
          position: 'relative',
          fontWeight: '$semibold',
          letterSpacing: '$snug',
          fontSize: '$base',
        }}
      >
        {input}
      </Div>
    </Wrapper>
  )
}

export default Prompt

const Wrapper = styled('div', {
  px: '$4',
  py: '$1',

  display: 'flex',
  cursor: 'text',

  variants: {
    newLine: {
      true: {
        alignItems: 'flex-start',
        flexDirection: 'column',
      },
      false: {
        alignItems: 'baseline',
        flexDirection: 'row',
      },
    },
  },
})

const CurrentDir = styled('div', {
  color: '$currentDirColor',
  py: '$1',
  px: '$2',
  ml: '-$2',
  mr: '$2',
  borderRadius: '$default',
  fontSize: '$sm',
  textDecoration: 'underline',
  fontFamily: '$mono',
  whiteSpace: 'nowrap',
  backgroundColor: '$currentDirBackgroundColor',
  display: 'block',
})
