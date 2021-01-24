import React, { useCallback, useEffect } from 'react'
import type { CellType } from '../../types'
import { Flex } from '../components'
import { styled } from '../stitches.config'
import useStore from '../store'
import Output from './output'
import Prompt from './prompt'

const Cell: React.FC<Pick<CellType, 'id' | 'focused'> & { tabId: string }> = ({
  id,
  tabId,
  focused,
}) => {
  const cell = useStore(useCallback(state => state.tabs[tabId][id], [id]))
  const dispatch = useStore(state => state.dispatch)

  useEffect(() => {
    if (cell.value === 'shortcuts')
      dispatch({ type: 'run-cell', id, input: cell.value })
  }, [])

  // it only breaks after we remove the first cell
  if (typeof cell === 'undefined') return null

  return (
    <Card onFocus={() => dispatch({ type: 'focus', id })} focused={focused}>
      <Prompt {...cell} focused={focused} />
      <Output {...cell} focused={focused} />
    </Card>
  )
}

export default Cell

const Card = styled(Flex, {
  position: 'relative',
  borderRadius: '$sm',
  flexDirection: 'column',
  // border: '1px solid transparent',

  variants: {
    focused: {
      true: {
        backgroundColor: '$focusedBackground',
        color: '$focusedForeground',
        // border: '1px solid $accent',
      },
    },
  },
})
