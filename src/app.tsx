import React, { useMemo } from 'react'
import Terminal from './components/terminal'
import { css } from './stitches.config'

export const globalStyles = css.global({
  body: {
    color: '$textColor',
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

  // useDarkMode(isDev, {
  //   classNameDark: darkThemeClass,
  // })

  return <Terminal />
}

export default App
