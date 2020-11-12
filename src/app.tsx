import React, { useEffect, useMemo } from 'react'
import Header from './components/header'
import { Div } from './components/shared'
import Terminal from './components/terminal'
import { css } from './stitches.config'
import useStore from './store'

export const globalStyles = css.global({
  body: {
    color: '$primaryTextColor',
    backgroundColor: '$backgroundColor',
    caretColor: '$caretColor',
    fontFamily: '$sans',

    overflow: 'hidden',
    position: 'relative',
    height: '100vh',

    '*': {
      '::selection': {
        backgroundColor: '$selectionColor',
      },
    },
  },
})

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
          overflowY: 'auto',
          overflowX: 'hidden',
          position: 'absolute',
          top: '2rem',
          right: 0,
          bottom: 0,
          left: 0,
        }}
      >
        <Terminal />
      </Div>
    </>
  )
}

export default App
