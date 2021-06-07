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
