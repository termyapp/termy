import useStore from '@src/store'
import { useMousetrap } from './'

export default function useGlobalShortcuts() {
  const dispatch = useStore(state => state.dispatch)

  useMousetrap('mod+t', () => {
    dispatch({ type: 'new-tab' })
  })
  useMousetrap('mod+w', () => {
    dispatch({ type: 'remove-cell' })
  })
  useMousetrap('mod+shift+w', () => {
    dispatch({ type: 'remove-tab' })
  })
  useMousetrap('mod+n', () => {
    dispatch({ type: 'new-cell' })
  })
  useMousetrap('mod+s', () => {
    dispatch({ type: 'kill-cell' })
  })
  useMousetrap('mod+r', () => {
    dispatch({ type: 'run-cell' })
  })
  useMousetrap(
    'mod+j',
    () => {
      dispatch({ type: 'focus-cell', id: 'next' })
    },
    { repeat: true },
  )
  useMousetrap(
    'mod+k',
    () => {
      dispatch({ type: 'focus-cell', id: 'previous' })
    },
    { repeat: true },
  )
  useMousetrap(
    'ctrl+tab',
    () => {
      dispatch({ type: 'focus-tab', id: 'next' })
    },
    { repeat: true },
  )
  useMousetrap(
    'ctrl+shift+tab',
    () => {
      dispatch({ type: 'focus-tab', id: 'previous' })
    },
    { repeat: true },
  )
}
