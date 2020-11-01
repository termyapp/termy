import React, { useState } from 'react'
import { useKey } from 'react-use'
import { styled } from '../../stitches.config'
import useStore from '../../store'
import Cell from './cell'

const Terminal: React.FC = () => {
  const cells = useStore(state => state.cells)
  const dispatch = useStore(state => state.dispatch)
  const [focused, setFocused] = useState(Object.keys(cells)[0])

  useKey('j', e => e.metaKey && dispatch({ type: 'new' }))

  // todo: https://github.com/STRML/react-grid-layout
  return (
    <Tissue>
      {Object.keys(cells).map(key => (
        <Cell key={key} {...cells[key]} />
      ))}
      <NewCell onClick={() => dispatch({ type: 'new' })}>
        Insert cell (⌘ + J)
      </NewCell>
    </Tissue>
  )
}

// 'cause cells form tissues
const Tissue = styled('div', {
  overflow: 'hidden',
  p: '$2',
})

const NewCell = styled('div', {
  color: '$gray700',
  py: '$5',
  textAlign: 'center',
  cursor: 'pointer',
})

export default Terminal
