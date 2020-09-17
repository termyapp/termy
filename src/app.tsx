import React, { useEffect } from 'react'
import useDarkMode from 'use-dark-mode'
import Terminal from './components/terminal'
import { isDev } from './lib'
import { darkThemeClass, css } from './stitches.config'

const App: React.FC = () => {
  const darkMode = useDarkMode(isDev, {
    classNameDark: darkThemeClass,
  })

  css.global({
    body: {
      backgroundColor: '$background',
      color: '$foreground',
    },
  })
  return <Terminal />
}

export default App
