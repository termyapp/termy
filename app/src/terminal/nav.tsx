import { Div, Flex } from '@components'
import useStore from '@src/store'
import { isMac } from '@src/utils'
import React from 'react'

export const navHeight = '28px'

const Nav: React.FC<{ tabs: string[]; activeTab: string }> = ({
  tabs,
  activeTab,
}) => {
  const dispatch = useStore(state => state.dispatch)
  return (
    <Flex
      className="header"
      css={{
        height: navHeight,
        width: '100%',
        flexDirection: isMac ? 'row' : 'row-reverse',
      }}
    >
      {/* spacing */}
      <Div css={{ width: '60px' }} />

      <Flex css={{ width: '100%', mb: '$1' }}>
        {tabs.length > 1 &&
          tabs.map((id, i) => (
            <Flex
              key={id}
              css={{
                width: '100%',
                alignItems: 'center',
                justifyContent: 'flex-end',
                backgroundColor:
                  id === activeTab ? '$focusedBackground' : '$background',
                px: '$3',
                color: '$secondaryForeground',
                fontSize: '$xs',
                borderRadius: '$sm',
                fontWeight: '$light',
              }}
              onClick={() => {
                dispatch({ type: 'focus-tab', id })
              }}
            >
              ⌘{i + 1}
            </Flex>
          ))}
      </Flex>
    </Flex>
  )
}

export default Nav
