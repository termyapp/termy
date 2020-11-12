import React from 'react'
import { Div } from './shared'

interface Props {}

const Header: React.FC<Props> = props => {
  return (
    <Div
      className="header"
      css={{
        height: '2rem',
        width: '100%',
      }}
    />
  )
}

export default Header
