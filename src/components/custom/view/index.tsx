import Path from 'path'
import React, { useEffect, useState } from 'react'
import { FileEntry, ViewCommand, ViewType } from '../../../interfaces'
import { promisified } from '../../../lib/tauri'
import { styled } from '../../../stitches.config'
import Highlight from './highlight'

export const viewCommand = async (path: string): Promise<ViewCommand> => {
  // use a custom command for now
  // in the future, you'll be able to run a command and capture it's ouput
  try {
    const data: ViewCommand = await promisified({
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

/**
 * Support many more filetypes in the future
 *
 * List command uses this to display the content of files (but has it's own dir viewer)
 */
const View = React.forwardRef<
  HTMLDivElement,
  { path: string; focusPrev?: () => void }
>(({ path, focusPrev }, ref) => {
  const [viewType, setViewType] = useState<ViewType | null>(null)
  const [content, setContent] = useState<string | FileEntry[] | null>(null)

  useEffect(() => {
    ;(async () => {
      const view = await viewCommand(path)
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
                // todo: table
                <div />
              )
            )
          case 'img':
            return <Image src={content as string} alt={path} />

          case 'text':
            const extension = Path.extname(path)

            return (
              <Highlight
                language={extension ? extension.replace(/./g, '') : undefined}
              >
                {content + ''}
              </Highlight>
            )
          default:
            return null
        }
      })()}
    </>
  )
})

const Image = styled('img', {
  maxHeight: '100%',
  maxWidth: '70vw',
  objectFit: 'contain',
  objectPosition: 'left',
  marginLeft: '$3',
  minWidth: 0,
})

export default View
