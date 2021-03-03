import { Div, Flex, Plus } from '@components'
import useStore, { dispatchSelector } from '@src/store'
import { ipc, isMac } from '@src/utils'
import type { WindowAction } from '@types'
import React from 'react'
import Tab from './tab'

interface Props {
  tabs: string[]
  activeTab: string
}

export default function Tabs({ tabs, activeTab }: Props) {
  const dispatch = useStore(dispatchSelector)
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

      <Flex css={{ width: '100%', mb: '$1', alignItems: 'center' }}>
        {tabs.map((id, i) => (
          // not that the current tab will display the cells (absolute positioned)
          <Tab key={id} id={id} index={i} activeTab={activeTab} />
        ))}
        <Flex
          className="no-drag"
          onClick={() => dispatch({ type: 'new-tab' })}
          css={{
            p: '$1',
            mx: '$1',
            borderRadius: '$md',
            opacity: 0.6,

            ':hover': {
              opacity: 1,
              backgroundColor: '$accent',
            },
          }}
        >
          <Plus
            css={{
              width: '15px',
              height: '15px',
            }}
          />
        </Flex>
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
