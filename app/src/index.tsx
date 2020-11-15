import React from 'react'
import ReactDOM from 'react-dom'
import App from './app'
import './index.css'
import './xterm.css'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

ReactDOM.render(
  // <React.StrictMode>
  <App />,
  document.getElementById('root'),
)

// Hot Module Replacement (HMR) - Remove this snippet to remove HMR.
// Learn more: https://www.snowpack.dev/#hot-module-replacement
if (import.meta.hot) {
  import.meta.hot.accept()
}
