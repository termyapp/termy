import { ipc } from '@src/utils'
import type { Cell } from '@types'
import { v4 } from 'uuid'

export const getDefaultCell = (): Cell => {
  const id = v4()
  return {
    id,
    currentDir: ipc.sync({ type: 'api', id, currentDir: '', value: 'home' })[0],
    value: '',
    type: null,
    status: null,
  }
}

export const nextOrLast = (key: string, keys: string[]) => {
  const index = keys.indexOf(key)
  const newIndex = index === keys.length - 1 ? index - 1 : index + 1
  return keys[newIndex]
}

export const nextOrPrevious = (
  direction: 'next' | 'previous',
  key: string,
  keys: string[],
) => {
  if (keys.length <= 1) return key

  const index = keys.indexOf(key)
  let newIndex
  if (direction === 'next') {
    newIndex = keys.length - 1 > index ? index + 1 : 0
  } else {
    newIndex = index > 0 ? index - 1 : keys.length - 1
  }
  return keys[newIndex]
}
