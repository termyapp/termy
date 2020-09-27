import React, { useEffect, useRef, useState } from 'react'
import { useKey } from 'react-use'
import { FileEntry, ViewCommand } from '../../interfaces'
import { styled } from '../../stitches.config'
import { File, Folder } from '../svg'
import View, { viewCommand } from './view'

const shortenFileName = (fileName: string) =>
  fileName.length > 30
    ? fileName.slice(0, 20) + '...' + fileName.slice(fileName.length - 10)
    : fileName

function withContainer<T>(Component: React.ComponentType<T>) {
  return (props: T) => (
    <Scroller>
      <Container>
        <Component {...props} />
      </Container>
    </Scroller>
  )
}

// Column
const List: React.FC<{ path: string; focusPrev?: () => void }> = ({
  path,
  focusPrev,
}) => {
  const [view, setView] = useState<ViewCommand | null>(null)

  useEffect(() => {
    ;(async () => {
      const view = await viewCommand(path)
      if (view) {
        setView(view)
      }
    })()
  }, [path])

  if (!view) {
    return null
  }

  const content =
    view.viewType === 'dir' ? JSON.parse(view.content) : view.content

  return Array.isArray(content) ? (
    <Files files={content as FileEntry[]} focusPrev={focusPrev} />
  ) : (
    <View path={path} />
  )
}

const Files = React.forwardRef<
  HTMLDivElement,
  { files: FileEntry[]; focusPrev?: () => void }
>(({ files, focusPrev }, ref) => {
  const last = files.length - 1

  const [selectedIndex, setSelectedIndex] = useState(0)
  const [focused, setFocused] = useState(false)
  const selected: FileEntry | undefined = files[selectedIndex]

  const nextViewRef = useRef<HTMLDivElement>(null)

  const onSelect = (index: number) => {
    setSelectedIndex(index)
  }

  const focusNext = () => {
    if (focused && selected?.isDir && nextViewRef.current) {
      nextViewRef.current.focus()
    }
  }

  useKey(
    'ArrowUp',
    () => focused && onSelect(selectedIndex > 0 ? selectedIndex - 1 : last),
    {},
    [selectedIndex, files, focused, last],
  )
  useKey(
    'ArrowDown',
    () =>
      focused &&
      onSelect(selectedIndex < files.length - 1 ? selectedIndex + 1 : 0),
    {},
    [selectedIndex, files, focused],
  )
  useKey('ArrowRight', focusNext, {}, [focused, selected, nextViewRef])
  useKey('ArrowLeft', focusPrev, {}, [focusPrev])

  return (
    <>
      <FilesContainer
        ref={ref}
        onFocus={() => {
          setFocused(true)
        }}
        onBlur={() => setFocused(false)}
        tabIndex={0}
      >
        {files.map((file, i) => (
          <Item
            key={file.path}
            onClick={() => setSelectedIndex(i)}
            type={selectedIndex === i ? 'active' : file.isDir ? 'dir' : 'file'}
          >
            {file.isDir ? (
              <Folder css={{ mr: '$2', width: '18px', height: '18px' }} />
            ) : (
              <File css={{ mr: '$2', width: '18px', height: '18px' }} />
            )}
            {shortenFileName(file.fileName)}
          </Item>
        ))}
      </FilesContainer>

      {selected && (
        <List
          path={selected.path}
          focusPrev={() => {
            if (ref) {
              // @ts-ignore
              ref.current.focus()
            }
          }}
        />
      )}
    </>
  )
})

const Scroller = styled('div', {
  overflowX: 'auto',
  display: 'flex',
})

const Container = styled('div', {
  maxHeight: '20rem',
  display: 'flex',
  flexWrap: 'nowrap',
})

const FilesContainer = styled('div', {
  width: '16rem',
  overflowY: 'auto',
  br: '$2',
  border: '1px solid transparent',

  '& + &': {
    marginLeft: '$2',
  },

  ':focus': {
    borderColor: '$gray400',
  },
})

const Item = styled('div', {
  padding: '$2',
  br: '$2',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  overflowX: 'auto',
  display: 'flex',
  alignItems: 'center',

  variants: {
    type: {
      dir: {
        fontWeight: '500',
        color: '$blue600',
        background: '$blue100',

        ':hover': {
          background: '$blue300',
        },
      },
      file: {
        color: '$gray700',
        fontWeight: 300,

        ':hover': {
          background: '$gray300',
        },
      },
      active: {
        color: '$background',
        backgroundColor: '$foreground',
        fontWeight: '600',
      },
    },
  },
})

export default withContainer(List)
