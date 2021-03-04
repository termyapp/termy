import { Div, Flex, Path, Plus, Span } from '@components'
import * as ReactTabs from '@radix-ui/react-tabs'
import { styled } from '@src/stitches.config'
import useStore, { dispatchSelector, Store } from '@src/store'
import { ipc, isMac } from '@src/utils'
import type { WindowAction } from '@types'
import React from 'react'
import shallow from 'zustand/shallow'
import Tab from './tab'

export const NAV_HEIGHT = '28px'

interface Props {}

const tabsSelector = (state: Store) => Object.keys(state.tabs)
const activeTabSelector = (state: Store) => state.activeTab
const isMaximizedSelector = (state: Store) => state.windowInfo.isMaximized

export default function Tabs(props: Props) {
  const dispatch = useStore(dispatchSelector)
  const tabs = useStore(tabsSelector, shallow)
  const activeTab = useStore(activeTabSelector)
  const isMaximized = useStore(isMaximizedSelector)

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
    <Div>
      <StyledTabs
        value={activeTab}
        onValueChange={id => dispatch({ type: 'focus-tab', id })}
      >
        <StyledList aria-label="tabs example" className="drag">
          {/* spacing for traffic lights on mac */}
          {isMac && <Div css={{ width: '75px' }} />}

          {/* header */}
          {tabs.map((id, i) => (
            <StyledTab key={id} value={id} className="no-drag">
              {i + 1}
            </StyledTab>
          ))}
          {/* new tab */}
          <Flex
            className="no-drag"
            onClick={() => dispatch({ type: 'new-tab' })}
            css={{
              p: '$1',
              mx: '$1',
              borderRadius: '$md',
              opacity: 0.6,
              alignItems: 'center',

              ':hover': {
                opacity: 1,
              },
            }}
          >
            <Plus css={{ width: '15px', height: '15px' }} />
          </Flex>

          {/* control items on !mac */}
          {!isMac && (
            <Flex css={{ ml: 'auto', alignItems: 'center' }}>
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
            </Flex>
          )}
        </StyledList>

        {/* content */}
        {tabs.map((id, i) => (
          <Tab key={id} id={id} index={i} activeTab={activeTab} />
        ))}
      </StyledTabs>
    </Div>
  )
}

const StyledTabs = styled(ReactTabs.Root, {
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
})

const StyledList = styled(ReactTabs.List, {
  flexShrink: 0,
  display: 'flex',
  overflow: 'hidden',
})

const StyledTab = styled(ReactTabs.Tab, {
  flexShrink: 0,
  padding: '5px 30px',
  color: 'slategray',
  userSelect: 'none',
  '&:hover': { color: '$foreground' },
  '&[data-state="active"]': {
    color: '$foreground',
    boxShadow: 'inset 0 -1px 0 0 currentColor, 0 1px 0 0 currentColor',
  },
})
