import React from 'react'
import { Div } from './shared'

interface Props {}

const Header: React.FC<Props> = props => {
  return <Div className="header" css={{ height: '1.8rem', width: '100%' }} />
}

export default Header
