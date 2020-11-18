import React, { useEffect, useMemo } from 'react'
import Header, { headerHeight } from './components/header'
import { Div } from './components/shared'
import Tab from './components/tab'
import { css, globalStyles } from './stitches.config'
import useStore from './store'

const App: React.FC = () => {
  useMemo(() => globalStyles(), [])
  const theme = useStore(state => state.theme)
  const themeClass = useMemo(() => css.theme(theme), [theme])

  useEffect(() => {
    document.body.className = themeClass
  }, [themeClass])

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
