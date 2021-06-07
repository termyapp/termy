import * as ReactTabs from '@radix-ui/react-tabs'
import { styled } from '../style'

export const TabRoot = styled(ReactTabs.Root, {
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
})

export const TabList = styled(ReactTabs.List, {
  flexShrink: 0,
  display: 'flex',
  overflow: 'hidden',
})

export const TabItem = styled(ReactTabs.Tab, {
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

export const TabPanel = styled(ReactTabs.Panel, {
  flexGrow: 1,
  height: '100%',
  display: 'grid',
  gridAutoRows: 'minmax(0, 1fr)',
  rowGap: '$2',
  py: '$1',

  '&[hidden]': {
    display: 'none',
  },
})
