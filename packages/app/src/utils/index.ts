import type { Status } from '@types'

export const isDev = import.meta.env.MODE === 'development'

export const isMac = /Mac/.test(navigator.userAgent)

export const focusCell = (id: string, status: Status) => {
  id = status === 'running' ? `output-${id}` : `input-${id}`
  document.getElementById(id)?.focus()
}

export * from './ipc'
export * from './monaco'
export * from './typed-cli'
