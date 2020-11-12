import React from 'react'
import { CellTypeWithFocused } from '../../types'
import { formatCurrentDir } from '../lib'
import { styled } from '../stitches.config'
import useStore from '../store'
import Input from './input'

const Prompt: React.FC<CellTypeWithFocused> = cell => {
  const { id, focused, currentDir } = cell
  const dispatch = useStore(state => state.dispatch)

  return (
    <Wrapper
      onClick={() => {
        dispatch({ type: 'focus', id })
      }}
      newLine={focused || currentDir.length > 60} // todo: do better with long lines
    >
      <CurrentDir focused={focused}>{formatCurrentDir(currentDir)}</CurrentDir>
      <Input {...cell} />
    </Wrapper>
  )
}

export default Prompt

const Wrapper = styled('div', {
  display: 'flex',
  cursor: 'text',

  variants: {
    newLine: {
      true: {
        alignItems: 'flex-start',
        flexDirection: 'column',
      },
      false: {
        alignItems: 'baseline',
        flexDirection: 'row',
      },
    },
  },
})

const CurrentDir = styled('div', {
  color: '$currentDirColor',
  py: '$1',
  px: '$2',
  ml: '-$2',
  mr: '$1',
  borderRadius: '$default',
  fontSize: '$xs',
  textDecoration: 'underline',
  fontFamily: '$mono',

  variants: {
    focused: {
      false: {
        backgroundColor: 'transparent',
        display: 'inline-block',
      },
      true: {
        backgroundColor: '$currentDirBackgroundColor',
        display: 'block',
      },
    },
  },
})
