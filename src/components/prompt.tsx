import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Portal } from 'react-portal'
import { createEditor, Editor, Node, Range, Transforms } from 'slate'
import { withHistory } from 'slate-history'
import {
  Editable,
  ReactEditor,
  RenderElementProps,
  Slate,
  withReact,
} from 'slate-react'
import {
  CellType,
  CellTypeWithFocused,
  FrontendMessage,
  Suggestion,
} from '../../types'
import { formatCurrentDir, ipc } from '../lib'
import { styled } from '../stitches.config'
import useStore from '../store'
import { Div } from './shared'

const getSuggestions = async (
  input: string,
  currentDir: string,
): Promise<Suggestion[] | null> => {
  try {
    if (input.length < 1) return null

    // const message: FrontendMessage = {
    //   type: 'get-suggestions',
    //   data: { input, currentDir },
    // }

    // const suggestions: Suggestion[] = ipc.sendSync('message', message)
    // console.log('suggestions', suggestions)
    return null
  } catch (error) {
    console.error('Error while getting files: ', error)
    return null
  }
}

const Prompt: React.FC<CellTypeWithFocused> = ({
  id,
  currentDir,
  input,
  focused,
}) => {
  const dispatch = useStore(state => state.dispatch)
  const editor = useMemo(
    () => withSuggestions(withHistory(withReact(createEditor()))),
    [],
  )
  const [value, setValue] = useState<Node[]>([
    {
      type: 'paragraph',
      children: [{ text: '' }],
    },
  ])

  const suggestionRef = useRef<HTMLDivElement>(null)

  const [target, setTarget] = useState<null | Range>(null)
  const [index, setIndex] = useState(0)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])

  const renderElement = useCallback(props => <Element {...props} />, [])

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
    ;(async () => {
      const newSuggestions = await getSuggestions(input, currentDir)
      if (newSuggestions) {
        setSuggestions(newSuggestions)
      }
    })()
  }, [input, currentDir])

  // update suggestions box position
  useEffect(() => {
    if (target && suggestions.length > 0 && suggestionRef.current) {
      const el = suggestionRef.current
      const domRange = ReactEditor.toDOMRange(editor, target)
      const rect = domRange.getBoundingClientRect()
      el.style.top = `${rect.top + window.pageYOffset - el.offsetHeight - 10}px`
      el.style.left = `${rect.left + window.pageXOffset}px`
    }
  }, [editor, index, suggestions.length, target])

  const onKeyDown = useCallback(
    event => {
      if (target && suggestions.length) {
        // focused on suggestions
        switch (event.key) {
          case 'ArrowUp':
            event.preventDefault()
            const prevIndex = index >= suggestions.length - 1 ? 0 : index + 1
            setIndex(prevIndex)
            break
          case 'ArrowDown':
            event.preventDefault()
            const nextIndex = index <= 0 ? suggestions.length - 1 : index - 1
            setIndex(nextIndex)
            break
          case 'Tab':
          case 'Enter':
            // suggestion enter
            event.preventDefault()
            Transforms.select(editor, target)
            insertSuggestion(editor, suggestions[index].command)
            setTarget(null)
            break
          case 'Escape':
            event.preventDefault()
            setTarget(null)
            break
        }
      } else if (event.key === 'Enter') {
        // run cell

        event.preventDefault() // don't allow multiline input
        if (!input) return

        dispatch({ type: 'run', id })
      }
    },
    [target, suggestions, index, editor, id, input],
  )

  return (
    <Div
      css={{
        boxShadow: '-3px -3px 5px #fff, 3px 3px 4px #9ea0a8',
        borderRadius: '$md',
        p: '$2',
      }}
    >
      <Slate
        editor={editor}
        value={value}
        onChange={newValue => {
          // console.log('val', newValue)
          setValue(newValue)
          dispatch({
            type: 'set-cell',
            id,
            cell: { input: newValue.map(n => Node.string(n)).join('\n') },
          })

          const { selection } = editor

          if (selection && Range.isCollapsed(selection)) {
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
          placeholder={formatCurrentDir(currentDir)}
          onKeyDown={onKeyDown}
          renderElement={renderElement}
        />
        {target && suggestions.length > 0 && (
          <Portal>
            <SuggestionsContainer ref={suggestionRef}>
              {suggestions.map((suggestion, i) => (
                <SuggestionItem
                  key={i}
                  type={i === index ? 'focused' : 'default'}
                >
                  {suggestion.command}
                </SuggestionItem>
              ))}
            </SuggestionsContainer>
          </Portal>
        )}
      </Slate>
    </Div>
  )
}

const SuggestionsContainer = styled('div', {
  top: '-9999px',
  left: '-9999px',
  position: 'absolute',
  zIndex: 1,
  display: 'flex',
  flexDirection: 'column-reverse',
  backgroundColor: '$gray200',
  br: '$2',
})

const SuggestionItem = styled('div', {
  py: '$2',
  px: '$3',
  br: '$2',

  variants: {
    type: {
      focused: {
        backgroundColor: '$gray400',
        color: '$foreground',
      },
      default: {
        backgroundColor: 'transparent',
        color: '$gray700',
      },
    },
  },
})

const Element = (props: RenderElementProps) => {
  switch (props.element.type) {
    case 'suggestion':
      return <SuggestionElement {...props} />
    default:
      return <p {...props.attributes}>{props.children}</p>
  }
}

const SuggestionElement = ({ attributes, children, element }: any) => {
  return (
    <span
      {...attributes}
      contentEditable={false}
      style={{ textDecoration: 'underline' }} // todo: this doesn't work. also, set suggestion by command type, not by regex matching
    >
      {children}
    </span>
  )
}

const insertSuggestion = (editor: ReactEditor, text: string) => {
  const suggestion = {
    type: 'suggestion',
    text,
  }

  Transforms.insertNodes(editor, suggestion)
  Transforms.move(editor)
  Transforms.insertText(editor, ' ')
}

const withSuggestions = (editor: ReactEditor) => {
  const { isInline, isVoid } = editor

  editor.isInline = element => {
    return element.type === 'suggestion' ? true : isInline(element)
  }

  editor.isVoid = element => {
    return element.type === 'suggestion' ? true : isVoid(element)
  }

  return editor
}

export default Prompt
