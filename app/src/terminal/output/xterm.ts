import useStore, { focusCell } from '@src/store'
import { ipc } from '@src/utils'
import type { CellType, Message, XtermSize } from '@types'
import { useEffect, useRef, useState } from 'react'
import { useDebounce } from 'react-use'
import type { Terminal } from 'xterm'
import xterm from 'xterm'
import { FitAddon } from 'xterm-addon-fit'

export const useXterm = ({ id, status, focused, type }: CellType) => {
  const theme = useStore(state => state.theme)
  const dispatch = useStore(state => state.dispatch)

  const [size, setSize] = useState<XtermSize>()

  let terminalRef = useRef<Terminal | null>(null)
  let terminalContainerRef = useRef<HTMLDivElement>(null)

  const fitAddon = new FitAddon()

  const over = status !== 'running'

  // init
  useEffect(() => {
    const terminal = new xterm.Terminal({
      cursorStyle: 'block',
    })

    if (terminalContainerRef.current)
      terminal.open(terminalContainerRef.current)

    // todo: https://xtermjs.org/docs/guides/flowcontrol/
    terminal.onKey(({ key, domEvent }) => {
      if (domEvent.shiftKey && domEvent.key === 'Tab') {
        focusCell(id)
      } else if (!terminal.getOption('disableStdin')) {
        console.log('key', key.charCodeAt(0))

        const message: Message = {
          type: 'frontend-message',
          id,
          stdin: key,
        }
        ipc.send('message', message)
      }
    })

    // adds an extra layer to focus...
    const xtermElemntThatMessesUpFocus = terminalContainerRef.current
      ?.children[0] as HTMLDivElement
    if (xtermElemntThatMessesUpFocus) {
      xtermElemntThatMessesUpFocus.tabIndex = -1
    }

    terminalRef.current = terminal
  }, [])

  useEffect(() => {
    if (status === null) {
      // remove previous content
      // terminalRef.current?.reset()
      // terminalRef.current?.setOption('disableStdin', false)
    } else if (status === 'running') {
      // remove previous content
      terminalRef.current?.reset()
      terminalRef.current?.setOption('disableStdin', false)

      // todo: this doesn't work here because it's too early to focus
      // currently focusing on each `pty` write (not ideal)
      terminalRef.current?.focus()
    } else if (over) {
      // disable stdin
      terminalRef.current?.setOption('disableStdin', true)

      terminalRef.current?.blur()
    }
  }, [status, over, id])

  // debounced onResize
  const [, cancel] = useDebounce(
    () => {
      if (!terminalRef.current || type !== 'text') return
      console.log('resize', size)

      terminalRef.current.loadAddon(fitAddon)
      fitAddon.fit()

      // pty only lives as long as it's not over
      if (over) return
      const message: Message = {
        type: 'frontend-message',
        id,
        size,
      }
      ipc.send('message', message)
    },
    80,
    [size, id, type],
  )

  // update theme
  useEffect(() => {
    const background = focused
      ? theme.colors.$focusedBackground
      : theme.colors.$background
    const cursor = over ? background : theme.colors.$caret
    terminalRef.current?.setOption('theme', {
      background,
      foreground: theme.colors.$foreground,
      selection: theme.colors.$selection, // color looks lighter in xterm, idk why
      cursor,
    })
    terminalRef.current?.setOption('fontFamily', theme.fonts.$mono)
  }, [theme, focused, over])

  // resize observer
  useEffect(() => {
    const updateSize = () => {
      if (terminalRef.current) {
        setSize({
          rows: terminalRef.current.rows,
          cols: terminalRef.current.cols,
        })
      }
    }

    updateSize()

    if (terminalContainerRef.current)
      new ResizeObserver(updateSize).observe(terminalContainerRef.current)
  }, [])

  return { terminalContainerRef, terminalRef }
}
