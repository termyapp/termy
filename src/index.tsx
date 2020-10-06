import React from 'react'
import ReactDOM from 'react-dom'
import './xterm.css'
import './reset.css'
import App from './app'

// doesn't work
// import * as native from 'native'
// console.log(native)
// console.log(native.hello())

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root'),
)

// Hot Module Replacement (HMR) - Remove this snippet to remove HMR.
// Learn more: https://www.snowpack.dev/#hot-module-replacement
if (import.meta.hot) {
  import.meta.hot.accept()
}
