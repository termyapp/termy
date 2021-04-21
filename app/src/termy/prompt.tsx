import { Div, Flex, GitBranch, Path, Span } from '@components'
import { styled } from '@src/stitches.config'
import { ipc } from '@src/utils'
import type { CellWithActive } from '@types'
import React, { useEffect, useState } from 'react'
import Input from './input'

export default function Prompt(cell: CellWithActive) {
  const { id, active, currentDir } = cell
  const [prettyPath, setPrettyPath] = useState(currentDir)
  const [branch, setBranch] = useState('')

  useEffect(() => {
    setPrettyPath(
      ipc.sync({ type: 'api', id, currentDir, value: 'pretty-path' })[0],
    )
    setBranch(ipc.sync({ type: 'api', id, currentDir, value: 'branch' })[0])
  }, [id, currentDir])

  return (
    <Wrapper
      active={active}
      // newLine={currentDir.length > 60} // todo: do better with long lines (add minWidth then wrap)
    >
      <CurrentDir status={cell.status === null ? 'default' : cell.status}>
        <Path>{prettyPath}</Path>
        {branch && (
          <Flex
            css={{
              color: '$secondaryForeground',
              ml: '$1',
              alignItems: 'center',
              '& + &': { ml: '$1' },
            }}
          >
            on
            <GitBranch />
            <Span css={{ fontWeight: '$medium' }}>{branch}</Span>
          </Flex>
        )}
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

const CurrentDir = styled(Flex, {
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
