import { OutputType, XtermSize } from './../../types'
import { useRef, useMemo, useEffect, useState } from 'react'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { ipc } from '.'
import { CellTypeWithFocused, Message } from '../../types'
import useStore from '../store'
import { useDebounce, useMeasure } from 'react-use'

export const useXterm = ({
  id,
  currentDir,
  focused,
  type,
}: CellTypeWithFocused & { type: OutputType }) => {
  const theme = useStore(state => state.theme)

  const [size, setSize] = useState<XtermSize>()

  let terminalRef = useRef<Terminal | null>(null)
  let terminalContainerRef = useRef<HTMLDivElement>(null)

  const fitAddon = new FitAddon()

  // init
  useEffect(() => {
    const terminal = new Terminal({
      cursorStyle: 'block',
    })

    if (terminalContainerRef.current)
      terminal.open(terminalContainerRef.current)

    // todo: https://xtermjs.org/docs/guides/flowcontrol/
    terminal.onKey(({ key, domEvent }) => {
      if (domEvent.metaKey && domEvent.key === 'Escape') {
        terminal.blur()
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

    // messes up focus
    // const xtermFocusElement = terminalContainerRef.current
    //   ?.children[0] as HTMLDivElement
    // if (xtermFocusElement) {
    //   xtermFocusElement.tabIndex = -1
    // }

    terminalRef.current = terminal
  }, [])

  // debounced onResize
  const [, cancel] = useDebounce(
    () => {
      if (!terminalRef.current || type !== 'pty') return
      console.log('resize', size)

      terminalRef.current.loadAddon(fitAddon)
      fitAddon.fit()

      const message: Message = {
        type: 'frontend-message',
        id,
        size,
      }
      ipc.send('message', message)
    },
    100,
    [size, id, type],
  )

  // update theme
  useEffect(() => {
    terminalRef.current?.setOption('theme', {
      // background: focused
      //   ? theme.colors.$focusedBackgroundColor
      //   : theme.colors.$backgroundColor,
      background: 'blue',
      foreground: theme.colors.$primaryTextColor,
      selection: theme.colors.$selectionColor, // color looks lighter in xterm, idk why
      cursor: theme.colors.$caretColor,
    })
    terminalRef.current?.setOption('fontFamily', theme.fonts.$mono)
  }, [theme])

  // resize listener
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
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  // useEffect(() => {
  //   // todo: reset when re running a cell
  //   console.log('status', status)

  //   // over
  //   if (status === 'success' || status === 'error') {
  //     // hide cursor
  //     terminalRef.current?.write('\u001B[?25l')

  //     // disable stdin
  //     terminalRef.current?.setOption('disableStdin', true)

  //     terminalRef.current?.blur()
  //   }
  // }, [status])

  return { terminalContainerRef, terminalRef }
}
