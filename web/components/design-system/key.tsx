import { useRouter } from 'next/dist/client/router'
import Link from 'next/link'
import React from 'react'
import useKey, { KeyFilter } from 'react-use/lib/useKey'
import { Flex } from './flex'
import { Text } from './text'

interface Props {
  code: KeyFilter
  fn: () => void
  ml?: boolean
}

export const Key: React.FC<Props> = ({ code, fn, ml = false, children }) => {
  useKey(
    e => e.code === code,
    e => {
      e.preventDefault()
      fn()
    },
    {},
    [code, fn],
  )
  return (
    <Text
      css={{
        display: 'inline-block',
        color: '$purple600',
        br: '$2',
        border: '1px solid $purple300',
        alignItems: 'center',
        background: '$purple200',
        px: '7px',
        py: '3px',
        fontSize: '$1',
        letterSpacing: '1px',
        lineHeight: 'normal',
        ml: ml ? '$2' : '0',
      }}
    >
      {children}
    </Text>
  )
}

export interface KeyProps {
  href: string
  external?: boolean
  shortcut?: { shortcutText: string; code: KeyFilter }
}

export const KeyLink: React.FC<KeyProps> = ({
  href,
  shortcut,
  external = false,
  children,
}) => {
  const router = useRouter()

  const content = (
    <>
      {children}
      {shortcut && (
        <Key
          code={shortcut.code}
          fn={() => (external ? window.open(href) : router.push(href))}
          ml
        >
          {shortcut.shortcutText}
        </Key>
      )}
    </>
  )

  return external ? (
    <Flex as="a" href={href} target="_blank" css={{ alignItems: 'center' }}>
      {content}
    </Flex>
  ) : (
    <Link href={href} passHref>
      <Flex as="a">{content}</Flex>
    </Link>
  )
}
