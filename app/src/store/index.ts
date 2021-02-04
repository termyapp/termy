import create, { UseStore } from 'zustand'
import { devtools, redux } from 'zustand/middleware'
import type { TAction } from './reducer'
import reducer from './reducer'
import { createState, IState } from './state'

interface Store extends IState {
  dispatch: (action: TAction) => void
}

// @ts-ignore
const useStore: UseStore<Store> = create(
  // @ts-ignore
  devtools(redux(reducer, createState())),
)

export default useStore
