import { Div } from '@components'
import { useMonaco } from '@monaco-editor/react'
import { useMousetrap } from '@src/hooks'
import React, { useEffect, useMemo } from 'react'
import shallow from 'zustand/shallow'
import { css, globalStyles } from '../stitches.config'
import useStore from '../store'
import { getThemeData, loadMonaco } from '../utils'
import Nav, { navHeight } from './nav'
import { TERMY } from './input'
import Tab from './tab'

loadMonaco()

export default function Terminal() {
  const dispatch = useStore(state => state.dispatch)
  const tabs = useStore(state => Object.keys(state.tabs), shallow)
  const activeTab = useStore(state => state.activeTab)

  const theme = useStore(state => state.theme)

  useMemo(() => globalStyles(), [])
  const themeClass = useMemo(() => css.theme(theme), [theme])

  useEffect(() => {
    document.body.className = themeClass
  }, [themeClass])

  const monaco = useMonaco()

  // update monaco theme
  useEffect(() => {
    monaco?.editor.defineTheme(TERMY, getThemeData(theme))
    monaco?.editor.setTheme(TERMY) // force re-render
  }, [theme, monaco])

  useMousetrap('mod+t', () => {
    dispatch({ type: 'new-tab' })
  })
  useMousetrap('mod+w', () => {
    dispatch({ type: 'remove-cell' })
  })
  useMousetrap('mod+shift+w', () => {
    dispatch({ type: 'remove-tab' })
  })
  useMousetrap('mod+n', () => {
    dispatch({ type: 'new-cell' })
  })
  useMousetrap('mod+s', () => {
    dispatch({ type: 'kill-cell' })
  })
  useMousetrap('mod+r', () => {
    // note: something overrides this in dev
    dispatch({ type: 'run-cell' })
  })
  useMousetrap(
    'mod+j',
    () => {
      dispatch({ type: 'focus-cell', id: 'next' })
    },
    { repeat: true },
  )
  useMousetrap(
    'mod+k',
    () => {
      dispatch({ type: 'focus-cell', id: 'previous' })
    },
    { repeat: true },
  )
  useMousetrap(
    'ctrl+tab',
    () => {
      dispatch({ type: 'focus-tab', id: 'next' })
    },
    { repeat: true },
  )
  useMousetrap(
    'ctrl+shift+tab',
    () => {
      dispatch({ type: 'focus-tab', id: 'previous' })
    },
    { repeat: true },
  )

  return (
    <>
      <Nav tabs={tabs} activeTab={activeTab} />
      <Div
        css={{
          position: 'absolute',
          height: `calc(100% - ${navHeight})`,
          width: '100%',
          top: navHeight,
          right: 0,
          bottom: 0,
          left: 0,
        }}
      >
        {tabs.map((id, i) => (
          <Tab key={id} id={id} index={i} activeTab={activeTab} />
        ))}
      </Div>
    </>
  )
}
