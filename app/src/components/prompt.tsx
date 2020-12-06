import {
  CheckIcon,
  Cross2Icon,
  DotSolidIcon,
  PlayIcon,
  StopIcon,
  UpdateIcon,
} from '@modulz/radix-icons'
import React from 'react'
import type { CellType } from '../../types'
import { formatCurrentDir } from '../lib'
import { styled } from '../stitches.config'
import Input from './input'
import { Div, Flex, Path } from './shared'

const Prompt: React.FC<CellType> = cell => {
  const { focused, currentDir } = cell

  return (
    <Wrapper
      focused={focused}
      // newLine={currentDir.length > 60} // todo: do better with long lines (decrease fontSize)
    >
      <CurrentDir>
        <Path>{formatCurrentDir(currentDir)}</Path>
      </CurrentDir>
      <Input {...cell} />
      <Status status={cell.status === null ? 'default' : cell.status}>
        {cell.status === 'success' && <CheckIcon />}
        {cell.status === 'running' && <PlayIcon />}
        {cell.status === 'error' && <Cross2Icon />}
      </Status>
    </Wrapper>
  )
}

export default Prompt

const Wrapper = styled(Div, {
  px: '$4',
  display: 'flex',
  alignItems: 'baseline',

  variants: {
    focused: {
      true: {},
      false: {},
    },
  },
})

const CurrentDir = styled(Div, {
  mr: '$3',
  fontSize: '$sm',
})

const Status = styled(Flex, {
  borderRadius: '$full',
  alignItems: 'center',
  p: '$1',

  svg: {
    width: '$4',
    height: '$4',
  },

  variants: {
    status: {
      default: {
        display: 'none',
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
