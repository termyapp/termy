import React from 'react'
import ReactDOM from 'react-dom'
import Terminal from './terminal'
import './css/index.css'
import './css/xterm.css'

ReactDOM.render(
  <React.StrictMode>
    <Terminal />
  </React.StrictMode>,
  document.getElementById('root'),
)

// Hot Module Replacement (HMR) - Remove this snippet to remove HMR.
// Learn more: https://www.snowpack.dev/#hot-module-replacement
// if (import.meta.hot) {
//   import.meta.hot.accept()
// }
