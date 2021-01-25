import mousetrap from 'mousetrap'
import { useEffect, useRef } from 'react'

type Callback = (e: mousetrap.ExtendedKeyboardEvent, combo: string) => any // return false to prevent default behaviour

// to make sure it's working when editor is focused
// https://stackoverflow.com/questions/21013866/mousetrap-bind-is-not-working-when-field-is-in-focus
mousetrap.prototype.stopCallback = function () {
  return false
}

// https://craig.is/killing/mice
export default function useMouseTrap(
  handlerKey: string | string[],
  callback: Callback,
  action?: 'keypress' | 'keydown' | 'keyup' | undefined,
) {
  let callbackRef = useRef<Callback>(callback)

  useEffect(() => {
    mousetrap.bind(handlerKey, callbackRef.current, 'keydown')
    console.log(handlerKey)
    return () => {
      mousetrap.unbind(handlerKey, action)
    }
  }, [handlerKey, action])
}
