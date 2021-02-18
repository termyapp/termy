import { Div, Flex, Path } from '@components'
import { CheckIcon, Cross2Icon, PlayIcon } from '@modulz/radix-icons'
import { styled } from '@src/stitches.config'
import { formatCurrentDir } from '@src/utils'
import type { CellWithActive } from '@types'
import React from 'react'
import Input from './input'

export default function Prompt(cell: CellWithActive) {
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
