import React, { useMemo } from 'react'
import useDarkMode from 'use-dark-mode'
import Terminal from './components/terminal'
import { isDev } from './lib'
import { css, darkThemeClass } from './stitches.config'

export const globalStyles = css.global({
  body: {
    color: '$primaryTextColor',
    backgroundColor: '$backgroundColor',
    caretColor: '$accentColor',
    fontFamily: '$sans',

    '*': {
      '::selection': {
        backgroundColor: '$selectionColor',
      },
    },
  },
})

const App: React.FC = () => {
  useMemo(() => globalStyles(), [])

  // todo: >theme #000 | #fff
  const darkMode = useDarkMode(!isDev, {
    classNameDark: darkThemeClass,
  })

  return <Terminal />
}

export default App
