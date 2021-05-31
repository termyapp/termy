import * as ReactTabs from '@radix-ui/react-tabs'
import useStore, { dispatchSelector, Store } from '@src/store'
import { ipc, isMac } from '@src/utils'
import { Div, Flex, styled, Svg } from '@termy/ui'
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
        onValueChange={(id: string) => dispatch({ type: 'focus-tab', id })}
        activationMode="manual" // imporant to prevent focus when doing middle click close
      >
        <StyledList aria-label="tabs example" className="drag">
          {/* spacing for traffic lights on mac */}
          {isMac && <Div css={{ width: '75px' }} />}

          {/* header */}
          {tabs.map((id, i) => (
            <StyledTab
              key={id}
              value={id}
              className="no-drag"
              onClick={e => e.preventDefault()}
              onAuxClick={e => {
                // middle click close
                if (e.button == 1) {
                  e.preventDefault()
                  dispatch({ type: 'remove-tab', id })
                }
              }}
            >
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
            <Svg
              css={{ width: '15px', height: '15px' }}
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8 2.75C8 2.47386 7.77614 2.25 7.5 2.25C7.22386 2.25 7 2.47386 7 2.75V7H2.75C2.47386 7 2.25 7.22386 2.25 7.5C2.25 7.77614 2.47386 8 2.75 8H7V12.25C7 12.5261 7.22386 12.75 7.5 12.75C7.77614 12.75 8 12.5261 8 12.25V8H12.25C12.5261 8 12.75 7.77614 12.75 7.5C12.75 7.22386 12.5261 7 12.25 7H8V2.75Z"
                fill="currentColor"
                fillRule="evenodd"
                clipRule="evenodd"
              ></path>
            </Svg>
          </Flex>

          {/* control items on !mac */}
          {!isMac && (
            <Flex
              css={{
                ml: 'auto',
                alignItems: 'center',
                marginTop: '-5px',
                marginBottom: '-5px',
              }}
            >
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
