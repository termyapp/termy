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

  const [target, setTarget] = useState<undefined | null | Range>(null) // undefined to hide after insertion
  const [index, setIndex] = useState(0)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [direction, setDirection] = useState<'column' | 'column-reverse'>(
    'column',
  )

  const input = useMemo(() => value.map(n => Node.string(n)).join('\n'), [
    value,
  ])

  // const renderElement = useCallback(props => <Element {...props} />, [])

  // focus input if cell becomes focused
  useEffect(() => {
    if (focused) {
      ReactEditor.focus(editor)

      // move cursor to the end
      Transforms.select(editor, Editor.end(editor, []))
    }
  }, [focused])

  // update suggestions
  useEffect(() => {
    const newSuggestions = getSuggestions(input, currentDir)
    if (newSuggestions) setSuggestions(target ? newSuggestions : [])
  }, [input, currentDir, target])

  // todo: new layout breaks this
  // update suggestions box position
  useEffect(() => {
    if (
      target &&
      suggestions.length > 0 &&
      suggestionRef.current &&
      inputRef.current
    ) {
      const suggestionElement = suggestionRef.current
      const inputElement = inputRef.current
      const domRange = ReactEditor.toDOMRange(editor, target)
      const rect = domRange.getBoundingClientRect()

      // calculate available top/bottom space of the element
      const topSpace =
        inputElement.offsetTop - window.pageYOffset + inputElement.offsetHeight
      const bottomSpace =
        window.pageYOffset + window.innerHeight - inputElement.offsetTop

      // calculate position of the suggestions box
      const padding = 5
      const top =
        bottomSpace > topSpace
          ? rect.top + window.pageYOffset + rect.height + padding
          : rect.top +
            window.pageYOffset -
            suggestionElement.offsetHeight -
            padding

      setDirection(bottomSpace > topSpace ? 'column' : 'column-reverse')

      // update values
      suggestionElement.style.top = `${top}px`
      suggestionElement.style.left = `${
        inputElement.offsetLeft + window.pageXOffset
      }px`
    }
  }, [editor, index, suggestions.length, target])

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (target && suggestions.length) {
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
            setTarget(undefined)
            const all = Editor.range(
              editor,
              Editor.start(editor, []),
              Editor.end(editor, []),
            )
            // insertSuggestion(editor, suggestions[index].command)
            Transforms.select(editor, all)
            Transforms.insertText(editor, suggestions[index].command)
            break
          case 'Escape':
            event.preventDefault()
            setTarget(undefined)
            break
        }
      } else if (event.key === 'Enter') {
        // run cell
        event.preventDefault() // don't allow multiline input

        if (!input) return
        dispatch({ type: 'run', id, input })
      }
    },
    [target, suggestions, index, editor, id, input],
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

          // setting target (needed for suggestions)
          const { selection } = editor
          if (typeof target == 'undefined') {
            // very hacky :/
            setTarget(null)
          } else if (selection && Range.isCollapsed(selection)) {
            const [start] = Range.edges(selection)
            const before = Editor.before(editor, start, { unit: 'word' })
            const beforeRange = before && Editor.range(editor, before, start)
            const beforeText = beforeRange && Editor.string(editor, beforeRange)

            if (beforeRange && beforeText) {
              setTarget(beforeRange)
              setIndex(0)
              return
            }
          }

          setTarget(null)
        }}
      >
        <Editable
          placeholder=">"
          onKeyDown={onKeyDown}
          // renderElement={renderElement}
        />
        {target && suggestions.length > 0 && (
          <Portal>
            <Div
              ref={suggestionRef}
              css={{
                position: 'absolute',
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
  if (input.length < 1) return null

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
