import {
  CheckIcon,
  Cross2Icon,
  DotSolidIcon,
  PlayIcon,
  StopIcon,
  UpdateIcon,
} from '@modulz/radix-icons'
import React from 'react'
import type { CellType } from '@types'
import { styled } from '@src/stitches.config'
import Input from './input'
import { Div, Flex, Path } from '@components'

const Prompt: React.FC<CellType> = cell => {
  const { active, currentDir } = cell

  return (
    <Wrapper
      active={active}
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
  py: '$1',
  display: 'flex',
  alignItems: 'center',

  variants: {
    active: {
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

const formatCurrentDir = (currentDir: string) => {
  const path = currentDir.split('/')
  if (path.length < 3) {
    return currentDir
  }
  const relativePath = currentDir.split('/').slice(3).join('/')
  return (relativePath.length > 0 ? '~/' : '~') + relativePath
}
