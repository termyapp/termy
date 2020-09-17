import Path from 'path'
import React, { useEffect, useRef, useState } from 'react'
import { FileEntry, ViewPath, ViewType } from '../../interfaces'
import { promisified } from '../../lib/tauri'
import Highlight from './highlight'
import { styled } from '../../stitches.config'

const viewPath = async (path: string): Promise<ViewPath> => {
  try {
    const data: ViewPath = await promisified({
      cmd: 'viewCommand',
      path,
    })
    console.log(data)
    return data
  } catch (error) {
    console.error('Error while getting files: ', error)
    return null
  }
}

interface Props {
  path: string
}

function withContainer<T>(Component: React.ComponentType<T>) {
  return (props: T) => (
    <Container>
      <Component {...props} />
    </Container>
  )
}

const View: React.FC<Props> = ({ path }) => {
  const firstViewRef = useRef<HTMLDivElement>(null)

  const [viewType, setViewType] = useState<ViewType | null>(null)
  const [content, setContent] = useState<string | FileEntry[] | null>(null)

  useEffect(() => {
    ;(async () => {
      const view = await viewPath(path)
      if (view) {
        setViewType(view.viewType)
        if (view.viewType === 'dir') {
          setContent(JSON.parse(view.content) as FileEntry[])
        } else {
          setContent(view.content as string)
        }
      }
    })()
  }, [path])

  // useEffect(() => {
  //   if (firstViewRef.current) {
  //     firstViewRef.current.focus()
  //   }
  // }, [])

  // useKey(
  //   'Escape',
  //   () => {
  //     getInput()?.focus()
  //   },
  //   {},
  //   [getInput],
  // )

  if (content === null) {
    return null
  }

  return (
    <>
      {(() => {
        switch (viewType) {
          case 'dir':
            return (
              Array.isArray(content) && (
                <Files files={content as FileEntry[]} ref={firstViewRef} />
              )
            )
          case 'img':
            return <Image src={content as string} alt={path} />

          case 'text':
            const extension = Path.extname(path)
            return (
              <Highlight
                language={extension ? extension.replaceAll('.', '') : undefined}
              >
                {content as string}
              </Highlight>
            )
          default:
            return null
        }
      })()}
    </>
  )
}

const Files = React.forwardRef<
  HTMLDivElement,
  { files: FileEntry[]; focusPrev?: () => void }
>(({ files, focusPrev }, ref) => {
  // const last = files.length - 1

  const [selectedIndex, setSelectedIndex] = useState(0)
  const [focused, setFocused] = useState(false)
  const selected: FileEntry | undefined = files[selectedIndex]

  // const nextViewRef = useRef<HTMLDivElement>(null)

  // const onSelect = (index: number) => {
  //   setSelectedIndex(index)
  // }

  // const focusNext = () => {
  //   if (focused && selected?.isDir && nextViewRef.current) {
  //     nextViewRef.current.focus()
  //   }
  // }

  // useKey(
  //   'ArrowUp',
  //   () => focused && onSelect(selectedIndex > 0 ? selectedIndex - 1 : last),
  //   {},
  //   [selectedIndex, files, last],
  // )
  // useKey(
  //   'ArrowDown',
  //   () =>
  //     focused &&
  //     onSelect(selectedIndex < files.length - 1 ? selectedIndex + 1 : 0),
  //   {},
  //   [selectedIndex, files],
  // )
  // useKey('ArrowRight', focusNext, {}, [focused, selected, nextViewRef])
  // useKey('ArrowLeft', focusPrev, {}, [focusPrev])

  return (
    <>
      <FilesContainer
        ref={ref}
        // onFocus={() => {
        //   setFocused(true)
        // }}
        // onBlur={() => setFocused(false)}
        tabIndex={0}
      >
        {files.map((file, i) => (
          <Item
            key={file.path}
            onClick={() => setSelectedIndex(i)}
            // focused={selectedIndex === i}
            type={file.isDir ? 'dir' : 'file'}
          >
            {file.fileName}
          </Item>
        ))}
      </FilesContainer>

      {selected && (
        <View
          path={selected.path}
          // ref={nextViewRef}
          // focusPrev={() => {
          //   if (ref) {
          //     // @ts-ignore
          //     ref.current.focus()
          //   }
          // }}
        />
      )}
    </>
  )
})

const Container = styled('div', {
  display: 'flex',
  flexWrap: 'nowrap',
  height: '20rem',
  width: 'min-content',
})

const FilesContainer = styled('div', {
  padding: '$1',
  background: '$gray100',
  borderRadius: '$3',
  width: '15rem',
  overflowY: 'scroll',

  '& + &': {
    marginLeft: '$3',
  },
})

const Item = styled('div', {
  padding: '$1',
  borderRadius: '$2',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  overflowX: 'auto',

  ':hover, :focus': {
    backgroundColor: '$gray400',
  },

  variants: {
    type: {
      dir: {
        fontWeight: 'bolder',
      },
      file: {
        color: '$gray700',
        fontWeight: 300,
      },
    },
  },
})

const Image = styled('img', {
  height: '100%',
  objectFit: 'contain',
  objectPosition: 'left',
  marginLeft: '$3',
})

const ViewWithContainer = withContainer(View)

export default ViewWithContainer
