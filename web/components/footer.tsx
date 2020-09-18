import Link from 'next/link'
import React from 'react'
import shortcuts from '../shortcuts'
import { Text, Logo, Key, KeyLink, Flex, Button, Box } from './design-system'

const Footer: React.FC = () => {
  return (
    <Flex
      as="footer"
      css={{
        justifyContent: 'space-between',
        alignItems: 'baseline',
        py: '$3',
        mt: '$9',
        borderTop: '1px solid $gray500',
      }}
    >
      <Link href="/">
        <a>
          <Logo />
        </a>
      </Link>
      <Flex as="ul" css={{}}>
        {[
          { ...shortcuts.KeyD, text: 'Docs' },
          { ...shortcuts.KeyI, text: 'Discord' },
          { ...shortcuts.KeyG, text: 'GitHub' },
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
            <KeyLink {...link} shortcut={undefined}>
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
    </Flex>
  )
}

export default Footer
