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
import { v4 as uuidv4 } from 'uuid'
import { promisified } from '../../../lib/tauri'
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

    const data: Suggestion[] = await promisified({
      cmd: 'prompt',
      input,
      currentDir,
    })
    console.log(data)
    return data.slice(0, 10)
  } catch (error) {
    console.error('Error while getting files: ', error)
    return null
  }
}

export const getInput = (): HTMLDivElement | null => {
  const input = document.querySelector<HTMLDivElement>('#input')
  if (input) {
    return input as HTMLDivElement
  }
  return null
}

interface Props {
  currentDir: string
  setCurrentDir: (newDir: string) => void
}

const Prompt = ({ currentDir, setCurrentDir }: Props) => {
  const { add, history } = useStore()
  const editor = useMemo(
    () => withSuggestions(withHistory(withReact(createEditor()))),
    [],
  )
  const [isFocused, setIsFocused] = useState(true)
  const [historyIndex, setHistoryIndex] = useState(history.length)
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

  const input = value.map(n => Node.string(n)).join('\n')

  useEffect(() => {
    ;(async () => {
      const newSuggestions = await getSuggestions(input, currentDir)
      if (newSuggestions) {
        setSuggestions(newSuggestions)
      }
    })()
  }, [input, currentDir])

  console.log(value[0], input)

  const onKeyDown = useCallback(
    event => {
      if (target && suggestions.length) {
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
        const input = value.map(n => Node.string(n)).join('\n')
        event.preventDefault() // don't allow multiline input
        if (!input) return

        const command = { id: uuidv4(), input, currentDir }

        setHistoryIndex(history.length + 1)
        add(command)
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
    [
      target,
      suggestions,
      index,
      editor,
      value,
      currentDir,
      history.length,
      add,
    ],
  )

  useEffect(() => {
    if (
      historyIndex >= 0 &&
      historyIndex < history.length &&
      history[historyIndex]
    ) {
      setValue([
        {
          type: 'paragraph',
          children: [{ text: history[historyIndex].input }],
        },
      ])
    } else if (historyIndex === history.length) {
      setValue([
        {
          type: 'paragraph',
          children: [{ text: '' }],
        },
      ])
    }
  }, [historyIndex, history])

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
    <Container>
      <Slate
        editor={editor}
        value={value}
        onChange={newValue => {
          if (isFocused) {
            setValue(newValue)
          }

          const { selection } = editor

          if (selection && Range.isCollapsed(selection)) {
            // const text = Editor.string(editor, [])
            // // prettier-ignore
            // const fileRegexp = new RegExp('^cd [\\\w\d/\.\-]*$', 'i')
            // const match = text.match(fileRegexp)

            // if (match) {
            // }
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
          key={isFocused + ''}
          autoFocus
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          id="input"
          className="h-full"
          placeholder={isFocused ? '>' : "Press 'Esc' to focus"}
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
  my: '$3',

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
  borderRadius: '$2',
})

const SuggestionItem = styled('div', {
  py: '$2',
  px: '$3',
  borderRadius: '$2',

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
