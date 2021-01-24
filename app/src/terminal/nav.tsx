import React from 'react'
import { Div } from '@components'

export const navHeight = '29px'

const Nav: React.FC<{ tabs: string[] }> = ({ tabs }) => {
  return (
    <Div
      className="header"
      css={{
        height: navHeight,
        width: '100%',
      }}
    />
  )
}

export default Nav
