import { useDebounce } from '@hooks'
import useStore, { dispatchSelector } from '@src/store'
import { isMac } from '@src/utils'
import { theme } from '@termy/ui'
import type { CellWithActive, XtermSize } from '@types'
import { useEffect, useRef, useState } from 'react'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { WebLinksAddon } from 'xterm-addon-web-links'

const SHORTCUTS = ['r', 't', 's', 'n', 'w', 'j', 'k']

const fitAddon = new FitAddon()

export default function useXterm({ id, status, active, type }: CellWithActive) {
  const dispatch = useStore(dispatchSelector)

  const [size, setSize] = useState<XtermSize>()

  let terminalRef = useRef<Terminal | null>(null)
  let terminalContainerRef = useRef<HTMLDivElement>(null)

  const over = status !== 'running'

  // init
  useEffect(() => {
    const terminal = new Terminal({
      cursorStyle: 'block',
    })

    terminal.loadAddon(
      new WebLinksAddon((_event: MouseEvent, uri: string) => {
        // the default handler doesn't work with electron (https://github.com/xtermjs/xterm.js/issues/2943)
        window.open(uri)
      }),
    )

    if (terminalContainerRef.current) terminal.open(terminalContainerRef.current)

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
        dispatch({ type: 'frontend-message', id, action: { write: key } })
      }
    })

    // adds an extra layer to focus...
    const xtermElemntThatMessesUpFocus = terminalContainerRef.current?.children[0] as HTMLDivElement
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
      if (!terminalRef.current || type !== 'tui' || !active) return

      // loading fitAddon here to avoid
      // `this api only accepts integers` error
      terminalRef.current.loadAddon(fitAddon)
      fitAddon.fit()

      // pty only lives as long as it's not over
      if (over || !size) return
      dispatch({ type: 'frontend-message', id, action: { resize: size } })
    },
    50,
    [size, id, type, active],
  )

  // update theme
  useEffect(() => {
    const background = theme.colors.background.value
    const cursor = over ? background : theme.colors.primary.value
    terminalRef.current?.setOption('theme', {
      background,
      foreground: theme.colors.foreground.value,
      selection: theme.colors.selection.value, // color looks lighter in xterm, idk why
      cursor,
    })
    terminalRef.current?.setOption('fontFamily', theme.fonts.mono.value)
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
