import { Div } from '@components'
import { useMonaco } from '@monaco-editor/react'
import { useMouseTrap } from '@src/hooks'
import React, { useCallback, useEffect, useMemo } from 'react'
import shallow from 'zustand/shallow'
import { css, globalStyles } from '../stitches.config'
import useStore from '../store'
import { getThemeData, isDev, loadMonaco } from '../utils'
import Nav, { navHeight } from './nav'
import { TERMY } from './prompt/input'
import Tab from './tab'

loadMonaco()

const App: React.FC = () => {
  const tabs = useStore(
    useCallback(state => Object.keys(state.tabs), []),
    shallow,
  )
  const dispatch = useStore(state => state.dispatch)
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

  useMouseTrap('meta+t', () => {
    dispatch({ type: 'new-tab' })
    return false
  })
  useMouseTrap('meta+w', () => {
    dispatch({ type: 'remove-cell' })
    return false
  })
  useMouseTrap('meta+shift+w', () => {
    dispatch({ type: 'remove-tab' })
    return false
  })
  useMouseTrap('meta+n', () => {
    dispatch({ type: 'new-cell' })
    return false
  })
  useMouseTrap('meta+r', () => {
    // prevent reload (allow force reload)
    // note: electron-debug overrides this in dev
    return !isDev
  })
  useMouseTrap('meta+j', () => {
    dispatch({ type: 'focus-cell', id: 'next' })
    return false
  })
  useMouseTrap('meta+k', () => {
    dispatch({ type: 'focus-cell', id: 'previous' })
    return false
  })

  console.log('tabs', tabs)
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
          <Tab key={id} id={id} active={activeTab === id} index={i} />
        ))}
      </Div>
    </>
  )
}

export default App
