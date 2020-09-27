import React, { useMemo } from 'react'
import useDarkMode from 'use-dark-mode'
import Terminal from './components/terminal'
import { isDev } from './lib'
import { css, darkThemeClass } from './stitches.config'

export const globalStyles = css.global({
  body: {
    fontFamily: '$sans',
    backgroundColor: '$background',
    color: '$foreground',
  },
})

const App: React.FC = () => {
  useMemo(() => globalStyles(), [])

  useDarkMode(isDev, {
    classNameDark: darkThemeClass,
  })

  return <Terminal />
}

export default App
