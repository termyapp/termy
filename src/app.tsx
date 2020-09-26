import React, { useEffect } from 'react'
import useDarkMode from 'use-dark-mode'
import Terminal from './components/terminal'
import { isDev } from './lib'
import { darkThemeClass, css } from './stitches.config'

export const globalStyles = css.global({
  body: {
    fontFamily: '$sans',
    backgroundColor: '$background',
    color: '$foreground',
  },
})

const App: React.FC = () => {
  globalStyles()
  const darkMode = useDarkMode(isDev, {
    classNameDark: darkThemeClass,
  })

  return <Terminal />
}

export default App
