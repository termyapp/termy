import mousetrap from 'mousetrap'
import { useEffect, useRef } from 'react'
import ReactDOM from 'react-dom'

type Callback = (e: mousetrap.ExtendedKeyboardEvent, combo: string) => any

interface Options {
  preventDefault?: boolean
  repeat?: boolean // todo: debouce repeats
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
  options = {
    preventDefault: true,
    repeat: false,
    action: undefined,
  } as Options,
  deps = [] as any[],
) {
  let callbackRef = useRef<Callback>(callback)
  const { action, repeat, preventDefault } = options

  useEffect(() => {
    mousetrap.bind(
      handlerKey,
      (...args) => {
        if (!repeat && args[0].repeat) return

        // https://github.com/pmndrs/zustand/discussions/286
        ReactDOM.unstable_batchedUpdates(() => {
          callbackRef.current(...args)
        })

        return !preventDefault // return false to prevent default behaviour
      },
      action,
    )
    return () => {
      mousetrap.unbind(handlerKey, action)
    }
  }, [handlerKey, action, ...deps])
}
