import React, { useEffect, useMemo } from 'react'
import { useKey } from 'react-use'
import { Div } from '@components'
import { css, globalStyles } from '../stitches.config'
import useStore from '../store'
import Header, { headerHeight } from './header'
import Tab from './tab'
import { isDev, loadMonaco, getThemeData } from '../utils'
import { TERMY } from './prompt/input'
import { useMonaco } from '@monaco-editor/react'

loadMonaco()

const App: React.FC = () => {
  useMemo(() => globalStyles(), [])
  const theme = useStore(state => state.theme)
  const themeClass = useMemo(() => css.theme(theme), [theme])

  const monaco = useMonaco()

  //   update theme
  useEffect(() => {
    console.log('here', monaco)
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

  return (
    <>
      <Header />
      <Div
        css={{
          position: 'absolute',
          height: `calc(100% - ${headerHeight})`,
          width: '100%',
          top: headerHeight,
          right: 0,
          bottom: 0,
          left: 0,
        }}
      >
        {/* todo: tabs */}
        <Tab />
      </Div>
    </>
  )
}

export default App
