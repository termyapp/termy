import React, { useMemo, useRef } from 'react'
import { useDebounce } from 'react-use'
import { createEditor, Editor, Node, Transforms } from 'slate'
import { withHistory } from 'slate-history'
import { Editable, ReactEditor, Slate, withReact } from 'slate-react'
import type { CellType, Message } from '../../types'
import { ipc } from '../lib'
import useStore from '../store'
import { Div } from './shared'
import Suggestions from './suggestions'

if (import.meta.hot) {
  // slate not happy w/ hot reload
  import.meta.hot.decline()
}

const Input: React.FC<CellType> = ({
  id,
  currentDir,
  value,
  focused,
  status,
}) => {
  const dispatch = useStore(state => state.dispatch)
  const editor = useMemo(() => withHistory(withReact(createEditor())), [])
  const inputRef = useRef<HTMLDivElement>(null)

  const input = useMemo(() => value.map(n => Node.string(n)).join('\n'), [
    value,
  ])

  // const { portalRef } = useSuggestions(input)

  // const renderElement = useCallback(props => <Element {...props} />, [])

  // update suggestions
  // todo: https://www.electronjs.org/docs/api/ipc-main#ipcmainhandlechannel-listener
  useDebounce(
    () => {
      ipc.send('message', {
        type: 'get-suggestions',
        id,
        input,
        currentDir,
      } as Message)
    },
    100,
    [id, input, currentDir],
  )

  return (
    <>
      <Div
        ref={inputRef}
        css={{
          width: '100%',
          position: 'relative',
          fontWeight: '$medium',
          letterSpacing: '$snug',
          fontSize: '$base',

          div: {
            py: '0.32rem',
          },
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
            id={id}
            autoFocus
            placeholder=">"
            readOnly={status === 'running'}
            onFocus={() => {
              Transforms.select(editor, Editor.end(editor, []))
              ReactEditor.focus(editor)
            }}
            onKeyDown={event => {
              if (event.key === 'Enter') {
                event.preventDefault() // prevent multiline input
              }
            }}
            // renderElement={renderElement}
          />
        </Slate>
      </Div>
      <Suggestions
        id={id}
        input={input}
        editor={editor}
        inputRef={inputRef}
        focused={focused}
      />
    </>
  )
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
