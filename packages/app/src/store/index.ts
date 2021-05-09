import create, { UseStore } from 'zustand'
import { devtools, redux } from 'zustand/middleware'
import type { Action } from './reducer'
import reducer from './reducer'
import { getState, saveState, State } from './state'

export interface Store extends State {
  dispatch: (action: Action) => void
}

// @ts-ignore
const useStore: UseStore<Store> = create(
  // @ts-ignore
  devtools(redux(reducer, getState())),
)

useStore.subscribe(saveState)

export const dispatchSelector = (state: Store) => state.dispatch
export const themeSelector = (state: Store) => state.theme

export default useStore
