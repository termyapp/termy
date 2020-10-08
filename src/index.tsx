import React from 'react'
import ReactDOM from 'react-dom'
import './xterm.css'
import './index.css'
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
