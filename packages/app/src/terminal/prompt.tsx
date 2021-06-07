import { ipc } from '@src/utils'
import { CurrentDir, Flex, Path, Prompt as Container, Span, Svg } from '@termy/ui'
import type { CellWithActive } from '@types'
import React, { useEffect, useState } from 'react'
import Input from './input'

export default function Prompt(cell: CellWithActive) {
  const { id, active, currentDir } = cell
  const [displayPath, setDisplayPath] = useState(currentDir)
  const [branch, setBranch] = useState('')

  useEffect(() => {
    setDisplayPath(
      ipc.sync({
        type: 'api',
        id,
        currentDir,
        value: 'current-dir --short',
      })[0],
    )
    setBranch(ipc.sync({ type: 'api', id, currentDir, value: 'branch' })[0])
  }, [id, currentDir, cell.active]) // cell.active: update on focus change

  return (
    <Container
      active={active}
      // newLine={currentDir.length > 60} // todo: do better with long lines (add minWidth then wrap)
    >
      <CurrentDir status={cell.status === null ? 'default' : cell.status}>
        <Path>{displayPath}</Path>

        {branch && (
          <Flex
            css={{
              color: '$secondaryForeground',
              ml: '$1',
              mr: '-$1',
              alignItems: 'center',
              opacity: 0.7,

              '& + &': { ml: '$1' },
            }}
          >
            <Svg viewBox="0 0 512 512">
              <title>Git Branch</title>
              <path d="M416 160a64 64 0 10-96.27 55.24c-2.29 29.08-20.08 37-75 48.42-17.76 3.68-35.93 7.45-52.71 13.93v-126.2a64 64 0 10-64 0v209.22a64 64 0 1064.42.24c2.39-18 16-24.33 65.26-34.52 27.43-5.67 55.78-11.54 79.78-26.95 29-18.58 44.53-46.78 46.36-83.89A64 64 0 00416 160zM160 64a32 32 0 11-32 32 32 32 0 0132-32zm0 384a32 32 0 1132-32 32 32 0 01-32 32zm192-256a32 32 0 1132-32 32 32 0 01-32 32z"></path>
            </Svg>
            <Span css={{ fontWeight: '$medium' }}>{branch}</Span>
          </Flex>
        )}
      </CurrentDir>
      <Input {...cell} />
    </Container>
  )
}
