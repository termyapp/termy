import useStore, { dispatchSelector } from '@src/store'
import { ipc } from '@src/utils'
import { Div, Flex, Path, Span, Svg, styled } from '@termy/ui'
import type { CellWithActive } from '@types'
import React, { useEffect, useState } from 'react'
import Input from './input'

export default function Prompt(cell: CellWithActive) {
  const dispatch = useStore(dispatchSelector)
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
    <Wrapper
      active={active}
      // newLine={currentDir.length > 60} // todo: do better with long lines (add minWidth then wrap)
    >
      <CurrentDir status={cell.status === null ? 'default' : cell.status}>
        <Div css={{ position: 'relative' }}>
          <FolderInput
            type="file"
            // @ts-ignore
            webkitdirectory=""
            // @ts-ignore
            directory=""
            title={currentDir}
            onChange={event => {
              const target = event.target as HTMLInputElement
              if (!target || !target.files || !target.files.length) return
              const [file] = target.files
              if (file) {
                const currentDir = file.path.split('/').slice(0, -1).join('/')
                if (currentDir)
                  dispatch({
                    type: 'set-cell',
                    id,
                    cell: { currentDir },
                  })
              }
            }}
          />
          <Path>{displayPath}</Path>
        </Div>
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
    </Wrapper>
  )
}

const FolderInput = styled('input', {
  position: 'absolute',
  width: '100%',
  height: '100%',
  top: 0,
  left: 0,
  opacity: 0,
})

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
  mr: '$2',
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
