import mousetrap from 'mousetrap'
import { useEffect } from 'react'

export default function useMouseTrap(
  handlerKey: string | string[],
  callback: (e: mousetrap.ExtendedKeyboardEvent, combo: string) => any,
  action?: 'keypress' | 'keydown' | 'keyup' | undefined,
) {
  useEffect(() => {
    mousetrap.bind(handlerKey, callback, action)

    return () => {
      mousetrap.unbind(handlerKey)
    }
  }, [handlerKey])
}
