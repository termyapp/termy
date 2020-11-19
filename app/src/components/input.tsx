import { formatDistanceToNow } from 'date-fns'
import Markdown from 'markdown-to-jsx'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Portal } from 'react-portal'
import { createEditor, Editor, Node, Range, Transforms } from 'slate'
import { withHistory } from 'slate-history'
import { Editable, ReactEditor, Slate, withReact } from 'slate-react'
import type { CellTypeWithFocused, Message, Suggestion } from '../../types'
import { ipc, useListener } from '../lib'
import { styled } from '../stitches.config'
import useStore from '../store'
import { Div } from './shared'
import { Dir } from './svg'
import { useDebounce } from 'react-use'

// todo: refactor

if (import.meta.hot) {
  // slate not happy w/ hot reload
  import.meta.hot.decline()
}

const Input: React.FC<CellTypeWithFocused> = ({
  id,
  currentDir,
  value,
  focused,
}) => {
  const dispatch = useStore(state => state.dispatch)
  const theme = useStore(state => state.theme)
  const editor = useMemo(() => withHistory(withReact(createEditor())), [])
  const [val, setVal] = useState([
    {
      type: 'paragraph',
      children: [{ text: '' }],
    },
  ] as Node[])

  const suggestionRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLDivElement>(null)

  const input = useMemo(() => value.map(n => Node.string(n)).join('\n'), [
    value,
  ])

  const [suggestions, setSuggestions] = useState<Suggestion[] | null>([])
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState<'column' | 'column-reverse'>(
    'column',
  )

  // const renderElement = useCallback(props => <Element {...props} />, [])

  // update suggestions
  useDebounce(
    () => {
      ipc.send('message', {
        type: 'get-suggestions',
        id,
        input,
        currentDir,
      } as Message)
    },
    20,
    [id, input, currentDir],
  )

  useListener(`suggestions-${id}`, (_, suggestions) =>
    setSuggestions(suggestions),
  )

  console.log(suggestions)

  // update suggestions box position
  useEffect(() => {
    const { selection } = editor
    if (suggestionRef.current && inputRef.current && selection) {
      const suggestionElement = suggestionRef.current
      const inputElement = inputRef.current

      const [start] = Range.edges(selection)
      const before = Editor.before(editor, start, { unit: 'character' })
      const beforeRange = before && Editor.range(editor, before, start)
      if (!beforeRange) return

      const domRange = ReactEditor.toDOMRange(editor, beforeRange)
      const rect = domRange.getBoundingClientRect()

      // calculate available top/bottom space of the element
      const topSpace = inputElement.offsetTop + inputElement.offsetHeight
      const bottomSpace = window.innerHeight - inputElement.offsetTop - 100

      setDirection(bottomSpace > topSpace ? 'column' : 'column-reverse')

      // todo: broken again w/ new layout
      // calculate position of the suggestions box
      const top =
        bottomSpace > topSpace
          ? rect.top + rect.height
          : rect.top - suggestionElement.offsetHeight - 10

      // update values
      suggestionElement.style.top = `${top}px`
      suggestionElement.style.left = `${rect.left}px`
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
          case 'Tab':
            // expand suggestion
            event.preventDefault()
            insertSuggestion(editor, suggestions[index].command)

            setSuggestions(null)
            break
          case 'Escape':
            event.preventDefault()
            setSuggestions(null)
            break
        }
      }

      if (event.key === 'Enter') {
        // run cell
        event.preventDefault() // don't allow multiline input

        const suggestion =
          suggestions && suggestions[index] && suggestions[index].command
        if (typeof suggestion === 'string') {
          insertSuggestion(editor, suggestion)
          dispatch({
            type: 'run-cell',
            id,
            input: suggestion,
          })

          // todo: doesn't work again... maybe blur would fix it
          setSuggestions(() => null)
        } else {
          dispatch({ type: 'run-cell', id, input })
        }
      }
    },
    [suggestions, index, editor, id, input, direction, dispatch],
  )

  return (
    <Div
      ref={inputRef}
      css={{
        width: '100%',
        py: '$2',
        position: 'relative',
        fontWeight: '$semibold',
        letterSpacing: '$snug',
        fontSize: '$base',
      }}
    >
      <Slate
        editor={editor}
        value={val}
        onChange={value => {
          // console.log('val', value)
          setVal(value)
          dispatch({
            type: 'set-cell',
            id,
            cell: { value },
          })
        }}
      >
        <Editable
          autoFocus
          placeholder=">"
          onKeyDown={onKeyDown}
          // renderElement={renderElement}
          onFocus={() => focusInput(editor)}
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
                backgroundColor: theme.colors.$focusedBackgroundColor,
                borderRadius: '$default',
                boxShadow: '$3xl',
                maxHeight: '60vh',
                border: '1px solid $accentColor',
              }}
            >
              {suggestions.map((suggestion, i) => (
                <SuggestionItem
                  key={i}
                  type={suggestion.kind}
                  state={i === index ? 'focused' : 'default'}
                >
                  {suggestion.kind === 'directory' && (
                    <Dir css={{ width: '$3', height: '100%', mr: '$1' }} />
                  )}
                  {suggestion.display
                    .split('')
                    .map((c, i) =>
                      suggestion.indexes.includes(BigInt(i)) ? (
                        <b key={i}>{c}</b>
                      ) : (
                        <span key={i}>{c}</span>
                      ),
                    )}
                  {suggestion.date && (
                    <Div
                      css={{
                        ml: 'auto',
                        pl: '$1',
                        color: i === index ? '$gray200' : '$gray600',
                        fontSize: '$xs',
                      }}
                    >
                      {formatDistanceToNow(parseInt(suggestion.date))}
                    </Div>
                  )}
                  {suggestion.documentation && (
                    <Div
                      css={{
                        position: 'absolute',
                        left: '100%',
                        top: 0,
                        color: '$primaryTextColor',
                        backgroundColor: '$backgroundColor',
                        px: '$2',
                        borderRadius: '$default',
                        boxShadow: '$3xl',
                        zIndex: 1,
                        overflowY: 'auto',
                        minWidth: '300px',
                        maxHeight: '60vh',
                        fontSize: '$xs',

                        '* > *': {
                          my: '$2',
                        },
                      }}
                    >
                      <Markdown>{suggestion.documentation}</Markdown>
                    </Div>
                  )}
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
    borderTop: '1px solid $accentColor',
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

const insertSuggestion = (editor: Editor, input: string) => {
  const all = Editor.range(
    editor,
    Editor.start(editor, []),
    Editor.end(editor, []),
  )
  Transforms.select(editor, all)
  Transforms.insertText(editor, input)
}

const focusInput = (editor: ReactEditor) => {
  // move cursor to the end
  Transforms.select(editor, Editor.end(editor, []))

  ReactEditor.focus(editor)
}

const themeCommand = {
  name: 'theme',
  documentation: "Change Termy's theme",
  subCommands: [
    {
      name: '#fff',
      documentation: '🌞 Light theme',
    },
    {
      name: '#000',
      documentation: '🌚 Dark theme',
    },
  ],
}

// const typedCliPrototype = (input: string): Suggestion[] => {
//   let args = input.split(' ')
//   const command = args.shift()
//   switch (command) {
//     case 'theme':
//       return themeCommand.subCommands
//         .filter(({ name }) => name.includes(args.join(' ')))
//         .map(c => ({
//           score: 100,
//           command: command + ' ' + c.name,
//           display: c.name,
//           kind: 'dir',
//         }))
//     default:
//       return []
//   }
// }

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
