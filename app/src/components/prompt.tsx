import React from 'react'
import type { CellTypeWithFocused } from '../../types'
import { formatCurrentDir } from '../lib'
import { styled } from '../stitches.config'
import Input from './input'

const Prompt: React.FC<CellTypeWithFocused> = cell => {
  const { focused, currentDir } = cell

  return (
    <Wrapper
      status={cell.status === null ? 'default' : cell.status}
      newLine={currentDir.length > 60} // todo: do better with long lines (decrease fontSize)
    >
      <CurrentDir focused={focused}>{formatCurrentDir(currentDir)}</CurrentDir>
      <Input {...cell} />
    </Wrapper>
  )
}

export default Prompt

const Wrapper = styled('div', {
  px: '$4',
  py: '$1',

  display: 'flex',
  cursor: 'text',
  borderRadius: '$lg',

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
    status: {
      default: {
        backgroundColor: '$defaultBackground',
        color: '$defaultForeground',
      },
      running: {
        backgroundColor: '$runningBackground',
        color: '$runningForeground',
      },
      success: {
        backgroundColor: '$successBackground',
        color: '$successForeground',
      },
      error: {
        backgroundColor: '$errorBackground',
        color: '$errorForeground',
      },
    },
  },
})

const CurrentDir = styled('div', {
  px: '$2',
  ml: '-$2',
  mr: '$2',
  fontSize: '$sm',
  textDecoration: 'underline',
  fontFamily: '$mono',
  whiteSpace: 'nowrap',
  letterSpacing: '$tighter',

  variants: {
    focused: {
      false: {
        opacity: 0.8,
        display: 'inline-block',
      },
      true: {
        opacity: 1,
        display: 'block',
      },
    },
  },
})
