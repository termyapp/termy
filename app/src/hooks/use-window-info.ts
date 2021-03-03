import useStore from '@src/store'
import type { WindowInfo } from '@types'
import { useListener } from './'

export default function useWindowInfo() {
  const dispatch = useStore(state => state.dispatch)
  useListener('window-info', (_, info: WindowInfo) => {
    dispatch({ type: 'update-window-info', info })
  })
}
