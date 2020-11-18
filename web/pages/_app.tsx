import { AppProps } from 'next/app'
import React from 'react'
import { globalStyles } from '../stitches.config'

const App: React.FC<AppProps> = ({ Component, pageProps }) => {
  globalStyles()

  return <Component {...pageProps} />
}

export default App
