import {
  CounterClockwiseClockIcon,
  ExternalLinkIcon,
  GearIcon,
} from '@modulz/radix-icons'
import { formatDistanceToNowStrict } from 'date-fns'
import Markdown from 'markdown-to-jsx'
import React, { useEffect, useRef, useState } from 'react'
import { useDebounce, useKey } from 'react-use'
import { Editor, Range, Transforms } from 'slate'
import { ReactEditor } from 'slate-react'
import type { Message, Suggestion } from 'types/shared'
import { ipc, shortenDate, useListener } from '../lib'
import { styled } from '../stitches.config'
import useStore from '../store'
import { Div, Span } from './shared'
import { Folder } from './svg'

interface Props {
  id: string
  input: string
  editor: Editor & ReactEditor
  inputRef: React.RefObject<HTMLDivElement>
  focused: boolean
  currentDir: string
}

const Suggestions: React.FC<Props> = ({
  id,
  input,
  editor,
  inputRef,
  focused,
  currentDir,
}) => {
  const dispatch = useStore(state => state.dispatch)
  const suggestionRef = useRef<HTMLDivElement>(null)

  const [show, setShow] = useState(true)
  const [suggestions, setSuggestions] = useState<Suggestion[] | null>([])
  const [index, setIndex] = useState<null | number>(null)
  const [direction, setDirection] = useState<'column' | 'column-reverse'>(
    'column',
  )

  // update suggestions
  // todo: https://www.electronjs.org/docs/api/ipc-main#ipcmainhandlechannel-listener
  useDebounce(
    () => {
      const result: Suggestion[] = ipc.sendSync('message', {
        type: 'get-suggestions',
        id,
        input,
        currentDir,
      } as Message)
      if (Array.isArray(result) && show) {
        setSuggestions(result)
      } else if (!show) {
        setShow(true)
      }
    },
    100,
    [id, input, currentDir, show],
  )

  // update popup position
  useEffect(() => {
    const { selection } = editor
    const suggestionElement = suggestionRef.current
    const inputElement = inputRef.current

    if (selection && suggestionElement && inputElement) {
      const [start] = Range.edges(selection)
      const before = Editor.before(editor, start, { unit: 'character' })
      const beforeRange = before && Editor.range(editor, before, start)
      if (!beforeRange) return

      const domRange = ReactEditor.toDOMRange(editor, beforeRange)
      const rect = domRange.getBoundingClientRect()
      const inputRect = inputElement.getBoundingClientRect()

      const topSpace = inputRect.y
      const bottomSpace = window.innerHeight - inputRect.y - inputRect.height

      setDirection(bottomSpace > topSpace ? 'column' : 'column-reverse')

      if (suggestionElement.children[0])
        // set items maxHeight
        (suggestionElement.children[0] as HTMLDivElement).style.maxHeight = `${
          (topSpace > bottomSpace ? topSpace : bottomSpace) - 10
        }px`
      const top =
        topSpace > bottomSpace
          ? inputRect.top - suggestionElement.offsetHeight
          : rect.bottom

      // update values
      suggestionElement.style.top = `${top}px`
      suggestionElement.style.left = `${rect.left}px`
    }

    // reset if index is out of bounds
    if (suggestions && index !== null && index > suggestions.length - 1)
      setIndex(null)
  }, [editor, index, suggestions])

  // scroll item into view
  useEffect(() => {
    if (
      suggestionRef.current &&
      suggestionRef.current.children[0] &&
      index !== null
    ) {
      const item = suggestionRef.current.children[0].children[
        index
      ] as HTMLDivElement
      if (item) item.scrollIntoView()
    }
  }, [index])

  // can't use onKeyDown, because Slate captures all events
  useKey(
    () => true,
    event => {
      if (focused && suggestions && suggestions.length > 0) {
        // focused on suggestions
        switch (event.key) {
          case 'ArrowUp': {
            event.preventDefault()

            if (index === null) {
              direction !== 'column-reverse'
                ? setIndex(suggestions.length - 1)
                : setIndex(0)
            } else {
              const nextIndex =
                direction !== 'column-reverse'
                  ? index <= 0
                    ? suggestions.length - 1
                    : index - 1
                  : index >= suggestions.length - 1
                  ? 0
                  : index + 1
              setIndex(nextIndex)
            }
            break
          }
          case 'ArrowDown': {
            event.preventDefault()

            if (index === null) {
              direction === 'column-reverse'
                ? setIndex(suggestions.length - 1)
                : setIndex(0)
            } else {
              const nextIndex =
                direction === 'column-reverse'
                  ? index <= 0
                    ? suggestions.length - 1
                    : index - 1
                  : index >= suggestions.length - 1
                  ? 0
                  : index + 1
              setIndex(nextIndex)
            }

            break
          }
          case 'Tab':
            event.preventDefault()
            if (index !== null)
              insertSuggestion(
                editor,
                // @ts-ignore
                suggestions[index].fullCommand
                  ? suggestions[index].fullCommand
                  : suggestions[index].command,
              )
            setShow(false)
            break
          case 'Enter':
            if (index !== null) {
              event.preventDefault()
              // @ts-ignore
              const input: string = suggestions[index].fullCommand
                ? suggestions[index].fullCommand
                : suggestions[index].command
              insertSuggestion(editor, input)
              dispatch({ type: 'run-cell', id, input })
              Transforms.select(editor, {
                anchor: Editor.start(editor, []),
                focus: Editor.end(editor, []),
              })
              setShow(false)
              setIndex(null)
            }
            break
          case 'Escape':
            event.preventDefault()
            setSuggestions(null)
            setIndex(null)
            break
        }
      }
    },
    {},
    [focused, input, suggestions, editor, index, direction],
  )

  // make sure we can run the cell when there are no suggestions
  useKey(
    () => true,
    event => {
      if (focused && event.key === 'Enter' && index === null) {
        event.preventDefault()
        dispatch({ type: 'run-cell', id, input })
        Transforms.select(editor, {
          anchor: Editor.start(editor, []),
          focus: Editor.end(editor, []),
        })
        setShow(false)
        setIndex(null)
      }
    },
    {},
    [focused, index, input],
  )

  if (!suggestions || suggestions.length < 1 || !focused || !show) return null

  return (
    <Popup ref={suggestionRef}>
      <Items
        style={{
          flexDirection: direction,
        }}
      >
        {suggestions.map((suggestion, i) => (
          <Item
            key={i}
            type={suggestion.kind}
            focused={i === index}
            onClick={() => {
              // todo: cell loses focus before this can get triggered
            }}
          >
            <Span
              css={{
                mr: '$1',

                display: 'flex',
                alignItems: 'center',

                svg: {
                  width: '$3',
                },
              }}
            >
              {renderIcon(suggestion.kind)}
            </Span>

            <Span css={{ whiteSpace: 'pre', overflow: 'hidden' }}>
              {renderSuggestionText(suggestion.command, suggestion.indexes)}
            </Span>

            {/* {suggestion.date && (
              <Date focused={i === index}>
                {shortenDate(
                  formatDistanceToNowStrict(parseInt(suggestion.date)),
                )}
              </Date>
            )} */}
          </Item>
        ))}
      </Items>
      {index !== null &&
        suggestions[index] &&
        suggestions[index].tldrDocumentation && (
          <DocumentationPopup>
            {/* @ts-ignore */}
            <Markdown>{suggestions[index].tldrDocumentation}</Markdown>
            <Div
              css={{
                position: 'absolute',
                right: '$4',
                top: '$2',
                textDecoration: 'none',
                color: '$secondaryForeground',

                display: 'flex',
                alignItems: 'center',
                svg: {
                  ml: '$1',
                  width: '$3',
                },
              }}
              as="a"
              href="https://github.com/tldr-pages/tldr"
            >
              📚tldr <ExternalLinkIcon />
            </Div>
          </DocumentationPopup>
        )}
    </Popup>
  )
}

export default Suggestions

const renderIcon = (kind: Suggestion['kind']) => {
  switch (kind) {
    case 'directory': {
      return <Folder />
    }
    case 'executable': {
      return <GearIcon />
    }
    case 'bash': {
      return <CounterClockwiseClockIcon />
    }
    default:
      return null
  }
}

const renderSuggestionText = (text: string, indexes: bigint[]) => {
  const children = []
  for (let i = 0; i < text.length; i++) {
    children[i] = indexes.includes(BigInt(i)) ? (
      <Span key={i} css={{ fontWeight: '$bold' }}>
        {text[i]}
      </Span>
    ) : (
      <span key={i}>{text[i]}</span>
    )
  }
  return children
}

const insertSuggestion = (editor: Editor, input: string) => {
  const all = Editor.range(
    editor,
    Editor.start(editor, []),
    Editor.end(editor, []),
  )
  Transforms.select(editor, all)
  Transforms.insertText(editor, input)
}

const Popup = styled(Div, {
  position: 'fixed',
  // important to set these to avoid flash
  top: '-99999px',
  left: '-99999px',
  zIndex: 1,

  p: '$1',
  borderRadius: '$lg',
  border: '1px solid $accent',
  backgroundColor: '$focusedBackground',
  boxShadow: '$3xl',
})

const Items = styled(Div, {
  display: 'flex',
  overflowY: 'auto',
  overflowX: 'hidden',
  maxWidth: '22rem',
})

const Item = styled(Div, {
  px: '$2',
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'nowrap',
  borderRadius: '$md',
  fontSize: '$sm',
  lineHeight: '$loose',
  cursor: 'pointer',
  letterSpacing: '$tight',
  fontWeight: '$medium',

  variants: {
    type: {
      directory: {},
      bash: {},
      executable: {},
    },

    focused: {
      true: {
        backgroundColor: '$focusedSuggestionBackground',
        color: '$focusedSuggestionForeground',
      },
      false: {
        color: '$secondaryForeground',

        ':hover': {
          backgroundColor: '$focusedSuggestionBackground',
          color: '$focusedSuggestionForeground',
          opacity: 0.72,
        },
      },
    },
  },
})

const Date = styled(Span, {
  ml: 'auto',
  pl: '$3',
  fontSize: '$xs',
  color: '$secondaryForeground',
  letterSpacing: '$tight',
  whiteSpace: 'nowrap',

  variants: {
    focused: {
      true: {
        color: '$focusedSuggestionForeground',
      },
    },
  },
})

const DocumentationPopup = styled(Div, {
  position: 'absolute',
  left: 'calc(100% + 3px)',
  zIndex: 1,
  top: 0,
  width: '25rem',

  // todo: calculate max w & h
  maxWidth: '70vh',
  maxHeight: '70vh',

  color: '$foreground',
  px: '$3',
  py: '$2',
  overflowY: 'auto',
  fontSize: '.8em',
  backgroundColor: '$focusedBackground',
  border: '1px solid $accent',
  borderRadius: '$lg',

  '* > *': {
    my: '$3',
  },
})
