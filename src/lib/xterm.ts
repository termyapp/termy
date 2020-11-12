import { OutputType } from './../../types'
import { useRef, useMemo, useEffect } from 'react'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { ipc } from '.'
import { CellTypeWithFocused, Message } from '../../types'
import useStore from '../store'

export const useXterm = ({
  id,
  currentDir,
  focused,
  type,
}: CellTypeWithFocused & { type: OutputType }) => {
  const theme = useStore(state => state.theme)

  const terminalContainerRef = useRef<HTMLDivElement>(null)
  const terminalRef = useRef<Terminal | null>(null)

  const terminalTheme = useMemo(
    () => ({
      background: focused
        ? theme.colors.$focusedBackgroundColor
        : theme.colors.$backgroundColor,
      foreground: theme.colors.$primaryTextColor,
      selection: theme.colors.$selectionColor, // color looks lighter in xterm, idk why
      cursor: theme.colors.$caretColor,
    }),
    [focused, theme],
  )
  useEffect(() => {
    if (!terminalContainerRef.current) return

    let term = new Terminal({
      cursorStyle: 'block',
      fontFamily: theme.fonts.$mono,
      theme: terminalTheme,
    })

    // todo: https://xtermjs.org/docs/guides/flowcontrol/
    term.onKey(({ key, domEvent }) => {
      if (domEvent.ctrlKey && domEvent.key === 'Tab') {
        terminalRef.current?.blur()
      } else if (!term.getOption('disableStdin')) {
        console.log('key', key.charCodeAt(0))

        const message: Message = {
          type: 'send-message',
          id,
          stdin: key,
        }
        ipc.send('message', message)
      }
    })

    terminalRef.current = term

    // messes up focus
    const xtermFocusElement = terminalContainerRef.current
      ?.children[0] as HTMLDivElement
    if (xtermFocusElement) {
      xtermFocusElement.tabIndex = -1
    }
  }, [currentDir, id, terminalTheme, theme.fonts.$mono])

  useEffect(() => {
    if (!terminalRef.current || !terminalContainerRef.current || type !== 'pty')
      return

    // fit
    const fitAddon = new FitAddon()
    terminalRef.current.loadAddon(fitAddon)
    if (terminalContainerRef.current)
      // todo: refactor this and update on resize
      terminalContainerRef.current.style.width =
        terminalContainerRef.current?.parentElement?.clientWidth + 'px'
    terminalRef.current.open(terminalContainerRef.current)
    fitAddon.fit()
  }, [type])

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

  useEffect(() => {
    terminalRef.current?.setOption('theme', terminalTheme)
  }, [terminalTheme])

  return { terminalContainerRef, terminalRef }
}
