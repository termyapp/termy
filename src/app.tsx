import React, { useMemo } from 'react'
import useDarkMode from 'use-dark-mode'
import Terminal from './components/terminal'
import { isDev } from './lib'
import { css, darkThemeClass } from './stitches.config'

export const globalStyles = css.global({
  html: {
    backgroundColor: '#333',
  },
  body: {
    fontFamily: '$sans',
    backgroundColor: '$background',
    color: '$foreground',
    caretColor: '#F46331',
    minHeight: 'calc(100vh - 2rem)',
    mt: '2rem',
    borderRadius: '$3',

    '*': {
      '::selection': {
        backgroundColor: 'rgba(249, 99, 49, .4)',
      },
    },
  },
})

const App: React.FC = () => {
  useMemo(() => globalStyles(), [])

  // useDarkMode(isDev, {
  //   classNameDark: darkThemeClass,
  // })

  return <Terminal />
}

export default App
