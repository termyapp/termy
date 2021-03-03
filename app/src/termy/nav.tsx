import { Div, Flex, Svg } from '@components'
import useStore from '@src/store'
import { ipc, isMac } from '@src/utils'
import type { WindowAction } from '@types'
import React from 'react'

interface Props {
  tabs: string[]
  activeTab: string
}

export default function Nav({ tabs, activeTab }: Props) {
  const dispatch = useStore(state => state.dispatch)
  const isMaximized = useStore(state => state.windowInfo.isMaximized)

  const sendWindowsMessage = (action: WindowAction) => () => {
    ipc.invoke({ type: 'window-action', action })
  }

  const controlItems = [
    {
      icon: 'minimize-window',
      onClick: sendWindowsMessage('minimize'),
    },
    {
      icon: isMaximized ? 'restore-window' : 'maximize-window',
      onClick: sendWindowsMessage(isMaximized ? 'unmaximize' : 'maximize'),
    },
    { icon: 'close-window', onClick: sendWindowsMessage('close') },
  ]

  return (
    <Flex
      as="nav"
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
              className="no-drag"
              key={id}
              css={{
                width: '100%',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor:
                  id === activeTab ? '$focusedBackground' : '$background',
                px: '$3',
                color: '$foreground',
                fontSize: '$xs',
                borderRadius: '$sm',
                fontWeight: '$medium',
                opacity: id === activeTab ? 1 : 0.5,
              }}
              onClick={() => {
                dispatch({ type: 'focus-tab', id })
              }}
            >
              {i + 1}
            </Flex>
          ))}
      </Flex>

      <Flex
        className="no-drag"
        onClick={() => dispatch({ type: 'new-tab' })}
        css={{
          width: '15px',
          height: '15px',
          mr: '$3',
          opacity: 0.6,

          ':hover': {
            opacity: 1,
          },
        }}
      >
        <Svg viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M8 2.75C8 2.47386 7.77614 2.25 7.5 2.25C7.22386 2.25 7 2.47386 7 2.75V7H2.75C2.47386 7 2.25 7.22386 2.25 7.5C2.25 7.77614 2.47386 8 2.75 8H7V12.25C7 12.5261 7.22386 12.75 7.5 12.75C7.77614 12.75 8 12.5261 8 12.25V8H12.25C12.5261 8 12.75 7.77614 12.75 7.5C12.75 7.22386 12.5261 7 12.25 7H8V2.75Z"
            fill="currentColor"
            fillRule="evenodd"
            clipRule="evenodd"
          ></path>
        </Svg>
      </Flex>

      {!isMac && (
        <Div css={{ display: 'flex', alignItems: 'center' }}>
          {controlItems.map(item => (
            <Div key={item.icon} onClick={item.onClick}>
              <Div
                as="svg"
                className="no-drag"
                css={{
                  width: 40,
                  height: 34,
                  padding: '12px 15px 12px 15px',
                  shapeRendering: 'crispEdges',
                }}
              >
                <use xlinkHref={`./control-icons.svg#${item.icon}`} />
              </Div>
            </Div>
          ))}
        </Div>
      )}
    </Flex>
  )
}

export const navHeight = '28px'
