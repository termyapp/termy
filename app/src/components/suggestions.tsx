import {
  CounterClockwiseClockIcon,
  ExternalLinkIcon,
  GearIcon,
} from '@modulz/radix-icons'
import { formatDistanceToNow } from 'date-fns'
import Markdown from 'markdown-to-jsx'
import React, { useEffect, useRef, useState } from 'react'
import { useKey } from 'react-use'
import { Editor, Range, Transforms } from 'slate'
import { ReactEditor } from 'slate-react'
import type { Suggestion } from 'types/shared'
import { useListener } from '../lib'
import { styled } from '../stitches.config'
import { Div, Span } from './shared'
import { Folder } from './svg'

interface Props {
  id: string
  editor: Editor & ReactEditor
  inputRef: React.RefObject<HTMLDivElement>
  focused: boolean
}

const Suggestions: React.FC<Props> = ({ id, editor, inputRef, focused }) => {
  const suggestionRef = useRef<HTMLDivElement>(null)

  const [show, setShow] = useState(true)
  const [suggestions, setSuggestions] = useState<Suggestion[] | null>([])
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState<'column' | 'column-reverse'>(
    'column',
  )

  useListener(
    `suggestions-${id}`,
    (_, suggestions) => (show ? setSuggestions(suggestions) : setShow(true)),
    [show],
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
  }, [editor, index, suggestions])

  // scroll item into view
  useEffect(() => {
    if (suggestionRef.current && suggestionRef.current.children[0]) {
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

            const nextIndex =
              direction !== 'column-reverse'
                ? index <= 0
                  ? suggestions.length - 1
                  : index - 1
                : index >= suggestions.length - 1
                ? 0
                : index + 1
            setIndex(nextIndex)
            break
          }
          case 'ArrowDown': {
            event.preventDefault()

            const nextIndex =
              direction === 'column-reverse'
                ? index <= 0
                  ? suggestions.length - 1
                  : index - 1
                : index >= suggestions.length - 1
                ? 0
                : index + 1
            setIndex(nextIndex)
            break
          }
          case 'Tab':
          case 'Enter':
            event.preventDefault()
            insertSuggestion(editor, suggestions[index].command)
            setShow(false)
            break
          case 'Escape':
            event.preventDefault()
            setSuggestions(null)
            break
        }
      }
    },
    {},
    [focused, suggestions, editor, index, direction],
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
            state={i === index ? 'focused' : 'default'}
            onClick={() => {
              insertSuggestion(editor, suggestions[i].command)
              setShow(false)
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
              {renderSuggestionText(suggestion.display, suggestion.indexes)}
            </Span>

            {suggestion.date && (
              <Date>{formatDistanceToNow(parseInt(suggestion.date))} ago</Date>
            )}
          </Item>
        ))}
      </Items>
      {suggestions[index] && suggestions[index].tldrDocumentation && (
        <DocumentationPopup>
          {/* @ts-ignore */}
          <Markdown>{suggestions[index].tldrDocumentation}</Markdown>
          <Div
            css={{
              position: 'absolute',
              right: '$4',
              top: '$2',
              textDecoration: 'none',
              color: '$secondaryTextColor',

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
})

const Items = styled(Div, {
  display: 'flex',
  overflowY: 'auto',
  overflowX: 'hidden',
  maxWidth: '22rem',
  borderRadius: '$default',
  backgroundColor: '$focusedBackgroundColor',
  boxShadow: '$3xl',
})

const Item = styled(Div, {
  p: '$2',
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'nowrap',
  fontSize: '$sm',
  cursor: 'pointer',

  ':hover': {
    backgroundColor: '$selectedSuggestionBackgroundColor',
    color: '$selectedSuggestionColor',
    opacity: 0.92,
  },

  variants: {
    type: {
      directory: {},
      bash: {},
      executable: {},
    },
    state: {
      focused: {
        backgroundColor: '$selectedSuggestionBackgroundColor',
        color: '$selectedSuggestionColor',
      },
      default: {
        color: '$secondaryTextColor',
      },
    },
  },
})

const Date = styled(Span, {
  ml: 'auto',
  pl: '$1',
  color: '$secondaryTextColor',
  fontSize: '$xs',
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

  color: '$primaryTextColor',
  px: '$3',
  py: '$2',
  overflowY: 'auto',
  fontSize: '.8em',
  backgroundColor: '$focusedBackgroundColor',
  border: '1px solid $accentColor',
  borderRadius: '$default',
  boxShadow: '2xl',

  '* > *': {
    my: '$3',
  },
})
