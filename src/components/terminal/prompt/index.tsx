import path from 'path'
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
import { CellType, FrontendMessage } from '../../../../types'
import { formatCurrentDir } from '../../../lib'
import { ipcRenderer } from '../../../lib/ipc'
import { styled } from '../../../stitches.config'
import useStore from '../../../store'

interface Suggestion {
  name: string
  score: number
  command: 'cd' | string
}

const getSuggestions = async (
  input: string,
  currentDir: string,
): Promise<Suggestion[] | null> => {
  try {
    if (input.length < 1) return null

    const message: FrontendMessage = {
      type: 'get-suggestions',
      data: { input, currentDir },
    }

    const data: Suggestion[] = ipcRenderer.sendSync('message', message)
    return data
  } catch (error) {
    console.error('Error while getting files: ', error)
    return null
  }
}

const Prompt: React.FC<CellType> = ({ id, currentDir, input }) => {
  const { run, setInput } = useStore()
  const editor = useMemo(
    () => withSuggestions(withHistory(withReact(createEditor()))),
    [],
  )
  const [isFocused, setIsFocused] = useState(true)
  const [value, setValue] = useState<Node[]>([
    {
      type: 'paragraph',
      children: [{ text: '' }],
    },
  ])

  const suggestionRef = useRef<HTMLDivElement>(null)

  const [target, setTarget] = useState<null | Range>(null)
  const [index, setIndex] = useState(0)
  const [search, setSearch] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const renderElement = useCallback(props => <Element {...props} />, [])

  // update suggestions
  useEffect(() => {
    ;(async () => {
      const newSuggestions = await getSuggestions(input, currentDir)
      if (newSuggestions) {
        setSuggestions(newSuggestions)
      }
    })()
  }, [input, currentDir])

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
            insertSuggestion(editor, suggestions[index].name)
            setTarget(null)
            break
          case 'Escape':
            event.preventDefault()
            setTarget(null)
            break
        }
      } else if (event.key === 'Enter') {
        event.preventDefault() // don't allow multiline input
        if (!input) return

        run(id)

        setValue([
          {
            type: 'paragraph',
            children: [{ text: '' }],
          },
        ])
        Editor.deleteBackward(editor, { unit: 'line' })
        ReactEditor.focus(editor)
      }
    },
    [target, suggestions, index, editor, value, currentDir],
  )

  useEffect(() => {
    if (target && suggestions.length > 0 && suggestionRef.current) {
      const el = suggestionRef.current
      const domRange = ReactEditor.toDOMRange(editor, target)
      const rect = domRange.getBoundingClientRect()
      el.style.top = `${rect.top + window.pageYOffset - el.offsetHeight - 10}px`
      el.style.left = `${rect.left + window.pageXOffset}px`
    }
  }, [editor, index, search, suggestions.length, target])

  return (
    <Container id="prompt">
      <Slate
        editor={editor}
        value={value}
        onChange={newValue => {
          if (isFocused) {
            // todo: why do we need isFocused?
            setValue(newValue)
            console.log('val', newValue)
            setInput(id, newValue.map(n => Node.string(n)).join('\n'))
          }

          const { selection } = editor

          if (selection && Range.isCollapsed(selection)) {
            const [start] = Range.edges(selection)
            const before = Editor.before(editor, start, { unit: 'word' })
            const beforeRange = before && Editor.range(editor, before, start)
            const beforeText = beforeRange && Editor.string(editor, beforeRange)

            if (beforeRange && beforeText) {
              setTarget(beforeRange)
              setSearch(beforeText)
              setIndex(0)
              return
            }
          }

          setTarget(null)
        }}
      >
        <Editable
          // autoFocus
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="h-full"
          placeholder={
            isFocused ? formatCurrentDir(currentDir) : "Press 'Esc' to focus"
          }
          onKeyDown={onKeyDown}
          renderElement={renderElement}
        />
        {target && suggestions.length > 0 && (
          <Portal>
            <SuggestionsContainer ref={suggestionRef}>
              {suggestions.map((suggestion, i) => (
                <SuggestionItem
                  key={suggestion.name + i}
                  type={i === index ? 'focused' : 'default'}
                >
                  {suggestion.command === 'cd'
                    ? path.relative(currentDir, suggestion.name)
                    : suggestion.name}
                </SuggestionItem>
              ))}
            </SuggestionsContainer>
          </Portal>
        )}
      </Slate>
    </Container>
  )
}

const Container = styled('div', {
  py: '$3',

  div: {
    backgroundColor: 'transparent',
  },
})

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
