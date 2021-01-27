import { Div } from '@components'
import { useMonaco } from '@monaco-editor/react'
import { useMousetrap } from '@src/hooks'
import React, { useEffect, useMemo } from 'react'
import shallow from 'zustand/shallow'
import { css, globalStyles } from '../stitches.config'
import useStore from '../store'
import { getThemeData, loadMonaco } from '../utils'
import Nav, { navHeight } from './nav'
import { TERMY } from './prompt/input'
import Tab from './tab'

loadMonaco()

const App: React.FC = () => {
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

  useMousetrap('meta+t', () => {
    dispatch({ type: 'new-tab' })
  })
  useMousetrap('meta+w', () => {
    dispatch({ type: 'remove-cell' })
  })
  useMousetrap('meta+shift+w', () => {
    dispatch({ type: 'remove-tab' })
  })
  useMousetrap('meta+n', () => {
    dispatch({ type: 'new-cell' })
  })
  useMousetrap(
    'meta+j',
    () => {
      dispatch({ type: 'focus-cell', id: 'next' })
    },
    { repeat: true },
  )
  useMousetrap(
    'meta+k',
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
  useMousetrap('meta+r', () => {
    // prevent reload
    // note: electron-debug overrides this in dev
  })

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

export default App
