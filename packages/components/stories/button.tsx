import React from 'react'

interface Props {
  label: string
  backgroundColor: string
}

export const Button = (props: Props) => {
  return <button style={{ backgroundColor: props.backgroundColor }}>{props.label}</button>
}

Button.defaultProps = {
  backgroundColor: null,
  primary: false,
  size: 'medium',
  onClick: undefined,
}
