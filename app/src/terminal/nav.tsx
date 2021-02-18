import { Div, Flex, Span } from '@components'
import useStore from '@src/store'
import { ipc, isMac } from '@src/utils'
import type { WindowMessage } from '@types'
import React from 'react'

export const navHeight = '28px'

const Nav: React.FC<{ tabs: string[]; activeTab: string }> = ({
  tabs,
  activeTab,
}) => {
  const dispatch = useStore(state => state.dispatch)

  const sendWindowsMessage = (message: WindowMessage) => () =>
    ipc.send('window', message)

  return (
    <Flex
      className="header"
      css={{
        height: navHeight,
        width: '100%',
      }}
    >
      {/* spacing */}
      {isMac && <Div css={{ width: '69px' }} />}

      <Flex css={{ width: '100%', mb: '$1' }}>
        {tabs.length > 1 &&
          tabs.map((id, i) => (
            <Flex
              key={id}
              css={{
                width: '100%',
                alignItems: 'center',
                justifyContent: 'center',
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

      {!isMac && (
        <Div css={{ display: 'flex', alignItems: 'center' }}>
          {[
            {
              icon: 'minimize-window',
              onClick: sendWindowsMessage('minimize'),
            },
            {
              icon: 'maximize-window',
              onClick: sendWindowsMessage('maximize'),
            },
            { icon: 'close-window', onClick: sendWindowsMessage('close') },
          ].map(item => (
            <Div key={item.icon} onClick={item.onClick}>
              <Span
                as="svg"
                className="no-drag"
                css={{
                  width: 40,
                  height: 34,
                  padding: '12px 15px 12px 15px',
                  opacity: 0.6,
                  shapeRendering: 'crispEdges',
                  cursor: 'pointer', // not working

                  ':hover': {
                    opacity: 1,
                  },
                }}
              >
                <use xlinkHref={`/control-icons.svg#${item.icon}`} />
              </Span>
            </Div>
          ))}
        </Div>
      )}
    </Flex>
  )
}

export default Nav
