import React, { useState } from 'react'
import { useKey } from 'react-use'
import { styled } from '../../stitches.config'
import useStore from '../../store'
import Cursor from '../cursor'
import Key from '../key'
import Cell from './cell'

const Terminal: React.FC = () => {
  const cells = useStore(state => state.cells)
  const dispatch = useStore(state => state.dispatch)
  const [focused, setFocused] = useState(Object.keys(cells)[0])

  useKey('j', e => e.metaKey && dispatch({ type: 'new' }))

  // todo: https://github.com/STRML/react-grid-layout
  return (
    <>
      <Tissue>
        {Object.keys(cells).map(key => (
          <Cell key={key} {...cells[key]} />
        ))}
      </Tissue>
      <NewCell onClick={() => dispatch({ type: 'new' })}>
        Insert cell (⌘ + J)
      </NewCell>
      <Keys>
        <Key />
        <Cursor />
      </Keys>
    </>
  )
}

// 'cause cells form tissues
const Tissue = styled('div', {
  overflow: 'hidden',
  backgroundColor: '#333',
  borderRadius: '$2',
  p: '$1',
})

// todo: Tile

const NewCell = styled('div', {
  color: '$gray500',
  py: '$5',
  textAlign: 'center',
  cursor: 'pointer',
})

const Keys = styled('div', {
  display: 'inline-grid',
  gridTemplateColumns: 'auto auto auto',
  background: '#333',
  p: '1px',
  borderRadius: '$2',
})

export default Terminal
