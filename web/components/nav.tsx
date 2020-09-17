import Link from 'next/link'
import React from 'react'
import shortcuts from '../shortcuts'
import { Text, Logo, Key, KeyLink, Flex, Button, Box } from './design-system'

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
      <Link href="/">
        <a>
          <Logo />
        </a>
      </Link>
      <Flex as="ul" css={{}}>
        {[
          { ...shortcuts.DOCS, text: 'Docs' },
          { ...shortcuts.COMMUNITY, text: 'Community' },
          { ...shortcuts.GITHUB, text: 'GitHub' },
        ].map(link => (
          <Box
            key={link.text}
            as="li"
            css={{
              '& + &': {
                ml: '$5',
              },
            }}
          >
            <KeyLink {...link}>
              <Text
                size="4"
                css={{
                  color: '$gray700',

                  ':hover': {
                    color: 'white',
                  },
                }}
              >
                {link.text}
              </Text>
            </KeyLink>
          </Box>
        ))}
      </Flex>

      <Button as="a" href={shortcuts.GET_ACCESS.href} variant="blue" css={{}}>
        Get early access
        <Key code="KeyA" fn={() => window.open(shortcuts.GET_ACCESS.href)} ml>
          A
        </Key>
      </Button>
    </Flex>
  )
}

export default Nav
