import { useDebounce } from '@hooks'
import useStore from '@src/store'
import { isMac } from '@src/utils'
import type { CellWithActive, Message, XtermSize } from '@types'
import { useEffect, useRef, useState } from 'react'
import type { Terminal } from 'xterm'
import xterm from 'xterm'
import { FitAddon } from 'xterm-addon-fit'

const SHORTCUTS = ['r', 't', 's', 'n', 'w', 'j', 'k']

export default function useXterm({ id, status, active, type }: CellWithActive) {
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

    terminal.attachCustomKeyEventHandler(e => {
      if (!isMac && e.ctrlKey && SHORTCUTS.includes(e.key)) return false
      else if (e.metaKey && e.key === 'v') {
        // paste
        navigator.clipboard.readText().then(text =>
          dispatch({
            type: 'frontend-message',
            id,
            action: { write: text },
          }),
        )
      }
      return true
    })

    terminal.onKey(({ key, domEvent }) => {
      if (!terminal.getOption('disableStdin')) {
        console.log('key', key.charCodeAt(0))
        dispatch({ type: 'frontend-message', id, action: { write: key } })
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
    if (status === 'running') {
      // remove previous content
      terminalRef.current?.reset()
      terminalRef.current?.setOption('disableStdin', false)
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
      if (over || !size) return
      dispatch({ type: 'frontend-message', id, action: { resize: size } })
    },
    50,
    [size, id, type],
  )

  // update theme
  useEffect(() => {
    const background = active
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
  }, [theme, active, over])

  // resize observer
  useEffect(() => {
    if (terminalContainerRef.current) {
      const updateSize = () => {
        if (terminalRef.current) {
          setSize({
            rows: terminalRef.current.rows,
            cols: terminalRef.current.cols,
          })
        }
      }

      updateSize()

      const resizeObserver = new ResizeObserver(updateSize)
      resizeObserver.observe(terminalContainerRef.current)
      return () => resizeObserver.disconnect()
    }
  }, [])

  return { terminalContainerRef, terminalRef }
}
