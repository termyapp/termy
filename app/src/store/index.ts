import create, { UseStore } from 'zustand'
import { devtools, redux } from 'zustand/middleware'
import type { Action } from './reducer'
import reducer from './reducer'
import { createState, State } from './state'

interface Store extends State {
  dispatch: (action: Action) => void
}

// @ts-ignore
const useStore: UseStore<Store> = create(
  // @ts-ignore
  devtools(redux(reducer, createState())),
)

export default useStore
