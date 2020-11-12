import { formatDistanceToNow } from 'date-fns'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Portal } from 'react-portal'
import { createEditor, Editor, Node, Range, Transforms } from 'slate'
import { withHistory } from 'slate-history'
import { Editable, ReactEditor, Slate, withReact } from 'slate-react'
import { CellTypeWithFocused, FrontendMessage, Suggestion } from '../../types'
import { ipc } from '../lib'
import { styled } from '../stitches.config'
import useStore from '../store'
import { Div } from './shared'
import { Dir } from './svg'

const Input: React.FC<CellTypeWithFocused> = ({
  id,
  currentDir,
  value,
  focused,
}) => {
  const dispatch = useStore(state => state.dispatch)
  const theme = useStore(state => state.theme)
  const editor = useMemo(() => withHistory(withReact(createEditor())), [])

  const suggestionRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLDivElement>(null)

  const input = useMemo(() => value.map(n => Node.string(n)).join('\n'), [
    value,
  ])

  const [suggestions, setSuggestions] = useState<Suggestion[] | null>(
    getSuggestions(input, currentDir),
  )
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState<'column' | 'column-reverse'>(
    'column',
  )

  // const renderElement = useCallback(props => <Element {...props} />, [])

  // focus input if cell becomes focused
  useEffect(() => {
    if (focused) {
      ReactEditor.focus(editor)

      // move cursor to the end
      Transforms.select(editor, Editor.end(editor, []))
    }
  }, [focused, editor])

  // update suggestions
  useEffect(() => {
    setSuggestions(suggestions =>
      // null is a *flag* that is set after inserting
      // a suggestion to avoid showing a the suggestion box
      suggestions === null ? [] : getSuggestions(input, currentDir),
    )
  }, [input, currentDir])

  // update suggestions box position
  useEffect(() => {
    const { selection } = editor
    const scroller = document.getElementById('scroller') as HTMLDivElement
    if (suggestionRef.current && inputRef.current && selection && scroller) {
      const suggestionElement = suggestionRef.current
      const inputElement = inputRef.current

      const [start] = Range.edges(selection)
      const before = Editor.before(editor, start, { unit: 'character' })
      const beforeRange = before && Editor.range(editor, before, start)
      if (!beforeRange) return

      const domRange = ReactEditor.toDOMRange(editor, beforeRange)
      const rect = domRange.getBoundingClientRect()

      // calculate available top/bottom space of the element
      const topSpace =
        inputElement.offsetTop - scroller.scrollTop + inputElement.offsetHeight
      const bottomSpace =
        scroller.scrollTop + scroller.offsetHeight - inputElement.offsetTop

      setDirection(bottomSpace > topSpace ? 'column' : 'column-reverse')

      // calculate position of the suggestions box
      const padding = 5
      const top =
        bottomSpace > topSpace
          ? rect.top + rect.height + padding
          : rect.top - suggestionElement.offsetHeight - padding

      // update values
      suggestionElement.style.top = `${top}px`
      suggestionElement.style.left = `${rect.left + scroller.offsetLeft}px`
    }
  }, [editor, index, suggestions])

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (suggestions && suggestions.length > 0) {
        // focused on suggestions
        switch (event.key) {
          case 'ArrowUp': {
            event.preventDefault()
            event.stopPropagation()

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
            event.stopPropagation()

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
          case 'Enter':
          case 'Tab':
            // suggestion enter
            event.preventDefault()
            const all = Editor.range(
              editor,
              Editor.start(editor, []),
              Editor.end(editor, []),
            )
            // insertSuggestion(editor, suggestions[index].command)
            Transforms.select(editor, all)
            Transforms.insertText(editor, suggestions[index].command)
            setSuggestions(null)
            break
          case 'Escape':
            event.preventDefault()
            setSuggestions(null)
            break
        }
      } else if (event.key === 'Enter') {
        // run cell
        event.preventDefault() // don't allow multiline input

        if (!input) return
        dispatch({ type: 'run', id, input })
      }
    },
    [suggestions, index, editor, id, input, direction, dispatch],
  )

  return (
    <Div
      ref={inputRef}
      css={{
        p: '$2',
        position: 'relative',
        fontWeight: '$medium',
        letterSpacing: '$tight',
        fontSize: '$base',
      }}
    >
      <Slate
        editor={editor}
        value={value}
        onChange={value => {
          // console.log('val', value)
          dispatch({
            type: 'set-cell',
            id,
            cell: { value },
          })
        }}
      >
        <Editable
          placeholder=">"
          onKeyDown={onKeyDown}
          // renderElement={renderElement}
        />
        {suggestions && (
          <Portal>
            <Div
              ref={suggestionRef}
              css={{
                position: 'absolute',

                // important to set these to avoid flash
                top: '-99999px',
                left: '-99999px',

                zIndex: 1,
                display: 'flex',
                flexDirection: direction,
                backgroundColor: theme.colors.$backgroundColor,
                borderRadius: '$default',
                boxShadow: '$3xl',
                maxHeight: '80vh',
                overflowY: 'auto',
              }}
            >
              {suggestions.map((suggestion, i) => (
                <SuggestionItem
                  key={i}
                  type={suggestion.suggestionType}
                  state={i === index ? 'focused' : 'default'}
                >
                  {suggestion.suggestionType === 'dir' && (
                    <Dir css={{ width: '$3', height: '100%', mr: '$1' }} />
                  )}
                  {suggestion.display}
                  <Div
                    css={{
                      ml: 'auto',
                      pl: '$1',
                      color: i === index ? '$gray200' : '$gray600',
                      fontSize: '$xs',
                    }}
                  >
                    {suggestion.date &&
                      formatDistanceToNow(parseInt(suggestion.date))}
                  </Div>
                </SuggestionItem>
              ))}
            </Div>
          </Portal>
        )}
      </Slate>
    </Div>
  )
}

const SuggestionItem = styled(Div, {
  p: '$2',
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'nowrap',

  fontSize: '$sm',

  '& + &': {
    borderTop: '1px solid $gray300',
  },

  variants: {
    type: {
      dir: {
        fontWeight: '$normal',
      },
      historyExternal: {},
    },
    state: {
      focused: {
        backgroundColor: '$blue500',
        color: '$white',
      },
      default: {},
    },
  },
})

// todo: use tokio to make this async
const getSuggestions = (input: string, currentDir: string) => {
  if (input.length < 1) return []

  const message: FrontendMessage = {
    type: 'get-suggestions',
    data: { input, currentDir },
  }

  const suggestions: Suggestion[] = [
    ...ipc.sendSync('message', message),
    ...typedCliPrototype(input),
  ]

  return suggestions
}

const themeCommand = {
  name: 'theme',
  description: "Change Termy's theme",
  subCommands: [
    {
      name: '#fff',
      description: '🌞 Light theme',
    },
    {
      name: '#000',
      description: '🌚 Dark theme',
    },
  ],
}

const typedCliPrototype = (input: string): Suggestion[] => {
  let args = input.split(' ')
  const command = args.shift()
  switch (command) {
    case 'theme':
      return themeCommand.subCommands
        .filter(({ name }) => name.includes(args.join(' ')))
        .map(c => ({
          score: 100,
          command: command + ' ' + c.name,
          display: c.name,
          suggestionType: 'dir',
        }))
    default:
      return []
  }
}

// for rich input
// const Element = (props: RenderElementProps) => {
//   const { attributes, children, element } = props

//   switch (element.type) {
//     case 'suggestion':
//       return <SuggestionElement {...props} />
//     default:
//       return <p {...attributes}>{children}</p>
//   }
// }

// const SuggestionElement = ({ attributes, children, element }: any) => {
//   return (
//     <Span
//       {...attributes}
//       contentEditable={false}
//       css={{ textDecoration: 'underline', backgroundColor: '$blue100' }}
//     >
//       {element.display}
//       {children}
//     </Span>
//   )
// }

// const insertSuggestion = (editor: ReactEditor, display: string) => {
//   const suggestion = {
//     type: 'suggestion',
//     display,
//     children: [{ text: '' }],
//   }

//   Transforms.insertNodes(editor, suggestion)
//   Transforms.move(editor)
//   Transforms.insertText(editor, ' ')
// }

// const withSuggestions = (editor: ReactEditor) => {
//   const { isInline, isVoid } = editor

//   editor.isInline = element => {
//     return element.type === 'suggestion' ? true : isInline(element)
//   }

//   editor.isVoid = element => {
//     return element.type === 'suggestion' ? true : isVoid(element)
//   }

//   return editor
// }

export default Input
