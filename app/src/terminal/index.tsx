import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useKey } from 'react-use'
import { Div } from '@components'
import { css, globalStyles } from '../stitches.config'
import useStore from '../store'
import Nav, { navHeight } from './nav'
import Tab from './tab'
import { isDev, loadMonaco, getThemeData } from '../utils'
import { TERMY } from './prompt/input'
import { useMonaco } from '@monaco-editor/react'
import shallow from 'zustand/shallow'

loadMonaco()

const App: React.FC = () => {
  const tabs = useStore(
    useCallback(state => Object.keys(state.tabs), []),
    shallow,
  )
  const theme = useStore(state => state.theme)
  const activeTab = useStore(state => state.activeTab)
  useMemo(() => globalStyles(), [])
  const themeClass = useMemo(() => css.theme(theme), [theme])

  const monaco = useMonaco()

  //   update theme
  useEffect(() => {
    monaco?.editor.defineTheme(TERMY, getThemeData(theme))
  }, [theme, monaco])

  useEffect(() => {
    document.body.className = themeClass
  }, [themeClass])

  // prevent reload (allow force reload)
  useKey('r', e => {
    // note electron-debug overrides this in dev
    if (!isDev && e.metaKey && !e.shiftKey) {
      e.preventDefault()
    }
  })

  // prevent reload (allow force reload)
  useKey('t', e => {
    // note electron-debug overrides this in dev
    if (e.metaKey) {
      e.preventDefault()
      // dispatch({type:})
    }
  })

  return (
    <>
      <Nav tabs={tabs} />
      <Div
        css={{
          position: 'absolute',
          height: `calc(100% - ${navHeight})nav`,
          width: '100%',
          top: navHeight,
          right: 0,
          bottom: 0,
          left: 0,
        }}
      >
        {tabs.map(id => (
          <Tab key={id} tabId={id} active={activeTab === id} />
        ))}
      </Div>
    </>
  )
}

export default App
