import { AppProps } from 'next/app'
import React from 'react'
import { reset } from 'stitches-reset'
import { css } from '../stitches.config'
import '../styles/index.css'

const App: React.FC<AppProps> = ({ Component, pageProps }) => {
  return <Component {...pageProps} />
}

export default App
