import { Div, Path, Span } from '@components'
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
      <CurrentDir status={cell.status === null ? 'default' : cell.status}>
        <Path>{formatCurrentDir(currentDir)}</Path>
      </CurrentDir>
      <Input {...cell} />
    </Wrapper>
  )
}

const Wrapper = styled(Div, {
  pl: '-$2',
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
  mr: '$1',
  ml: '$2',
  fontSize: '$sm',
  transform: 'translateY(1.5px)',
  position: 'relative',
  px: '$2',
  borderRadius: '$md',

  variants: {
    status: {
      default: {},
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
