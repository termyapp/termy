import mousetrap from 'mousetrap'
import { useEffect, useRef } from 'react'
import ReactDOM from 'react-dom'

type Callback = (e: mousetrap.ExtendedKeyboardEvent, combo: string) => any // return false to prevent default behaviour

interface Options {
  repeat?: boolean
  action?: 'keypress' | 'keydown' | 'keyup' | undefined
}

// to make sure it's working when editor is focused
// https://stackoverflow.com/questions/21013866/mousetrap-bind-is-not-working-when-field-is-in-focus
mousetrap.prototype.stopCallback = function () {
  return false
}

// https://craig.is/killing/mice
export default function useMousetrap(
  handlerKey: string | string[],
  callback: Callback,
  options = { repeat: false, action: undefined } as Options,
) {
  let callbackRef = useRef<Callback>(callback)
  const { action, repeat } = options

  useEffect(() => {
    mousetrap.bind(
      handlerKey,
      (...args) => {
        if (!repeat && args[0].repeat) return

        // https://github.com/pmndrs/zustand/discussions/286
        ReactDOM.unstable_batchedUpdates(() => {
          callbackRef.current(...args)
        })
      },
      action,
    )
    return () => {
      mousetrap.unbind(handlerKey, action)
    }
  }, [handlerKey, action])
}
