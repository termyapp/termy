import { Div, Flex } from '@components'
import React from 'react'

export const navHeight = '28px'

const Nav: React.FC<{ tabs: string[] }> = ({ tabs }) => {
  return (
    <Flex
      className="header"
      css={{
        height: navHeight,
        width: '100%',
      }}
    >
      <Div css={{ width: '60px' }}></Div>
      <Flex>
        {tabs.map((id, i) => (
          <Div key={id}>{i + 1}</Div>
        ))}
      </Flex>
    </Flex>
  )
}

export default Nav
