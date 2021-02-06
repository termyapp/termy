import { Div, Flex } from '@components'
import useStore from '@src/store'
import { Close } from '@src/svg'
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
        {['minimize-window',
        
        'maximize-window','close-window' ].map()}
                <Div className={`${left ? 'header_minimizeWindowLeft' : ''}`} onClick={}>
                  <Span as="svg" css={{        width: 40px;
            height: 34px;
            padding: 12px 15px 12px 15px;
            -webkit-app-region: no-drag;
            color: #fff;
            opacity: 0.5;
            shape-rendering: crispEdges;}}>
                    <use xlinkHref="/control-icons.svg#" />
                  </svg>
                </Div>
                <Div className={`${left ? 'header_maximizeWindowLeft' : ''}`} onClick={}>
                  <svg className="header_shape">
                    <use xlinkHref={maxButtonHref} />
                  </svg>
                </Div>
                <Div
                  className={`header_closeWindow ${left ? 'header_closeWindowLeft' : ''}`}
                  onClick={this.handleCloseClick}
                >
                  <svg className="header_shape">
                    <use xlinkHref="./renderer/assets/icons.svg#" />
                  </svg>
                </Div>
        </Div>
      )}
    </Flex>
  )
}

export default Nav
