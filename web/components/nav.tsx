import React from 'react'
import { Button, Flex, Logo, Text } from './design-system'

const Nav: React.FC = () => {
  return (
    <Flex
      as="nav"
      css={{
        justifyContent: 'space-between',
        alignItems: 'baseline',
        py: '$3',
        mt: '$2',
      }}
    >
      <Logo />
      <Flex css={{ alignItems: 'center' }}>
        <Text
          as="a"
          href="http://discord.com/invite/tzrRhdZ"
          target="_blank"
          css={{
            color: '$gray700',
            cursor: 'pointer',
            mr: '$5',
            ':hover': {
              color: 'black',
              textDecoration: 'underline',
            },
          }}
        >
          Discord
        </Text>
        <Text
          as="a"
          href="https://github.com/termyapp/Termy"
          target="_blank"
          css={{
            color: '$gray700',
            cursor: 'pointer',
            mr: '$5',
            ':hover': {
              color: 'black',
              textDecoration: 'underline',
            },
          }}
        >
          Github
        </Text>
        <Button
          as="a"
          href="https://github.com/termyapp/Termy/releases/download/v0.1.4/Termy-0.1.4.dmg"
        >
          Download
        </Button>
      </Flex>
    </Flex>
  )
}

export default Nav
