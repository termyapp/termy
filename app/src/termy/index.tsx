import { useListener } from '@src/hooks'
import useStore from '@src/store'
import React from 'react'
import type { WindowInfo } from 'types/shared'
import Terminal from './terminal'

export default function Termy() {
  const dispatch = useStore(state => state.dispatch)
  useListener('window-info', (_, info: WindowInfo) => {
    dispatch({ type: 'update-window-info', info })
  })

  return <Terminal />
}
