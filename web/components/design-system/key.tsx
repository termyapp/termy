import { useRouter } from 'next/dist/client/router'
import Link from 'next/link'
import React from 'react'
import { useKey } from 'react-use'
import { Div, Flex, Text } from './'

// const useBreakPoint = createBreakpoint({ mobile: 300, desktop: 900 })
// const breakpoint = useBreakPoint()
// if (breakpoint === 'mobile') return null

export interface KeyProps {
  href: string
  external?: boolean
  shortcut: string
}

export const Key: React.FC<KeyProps> = ({
  href,
  shortcut,
  external = false,
  children,
}) => {
  const router = useRouter()

  useKey(shortcut, () => (external ? window.open(href) : router.push(href)))

  const content = (
    <Flex
      css={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '$md',
        border: '1px solid $gray400',
        px: '$2',
        fontWeight: '$medium',
      }}
    >
      <Text
        css={{
          display: 'block',
          color: '$gray700',
          fontFamily: '$mono',
        }}
      >
        {children}
      </Text>
    </Flex>
  )

  return external ? (
    <Div as="a" href={href} target="_blank" css={{ display: 'inline-block' }}>
      {content}
    </Div>
  ) : (
    <Link href={href} passHref>
      <Div as="a">{content}</Div>
    </Link>
  )
}
