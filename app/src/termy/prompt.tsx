import { Div, Flex, GitBranch, Path, Span } from '@components'
import { styled } from '@src/stitches.config'
import useStore, { dispatchSelector } from '@src/store'
import { ipc } from '@src/utils'
import type { CellWithActive } from '@types'
import React, { useEffect, useState } from 'react'
import Input from './input'

export default function Prompt(cell: CellWithActive) {
  const dispatch = useStore(dispatchSelector)
  const { id, active, currentDir } = cell
  const [prettyPath, setPrettyPath] = useState(currentDir)
  const [branch, setBranch] = useState('')

  useEffect(() => {
    setPrettyPath(
      ipc.sync({ type: 'api', id, currentDir, value: 'pretty-path' })[0],
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
          <Path>{prettyPath}</Path>
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
            <GitBranch />
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
