import { styled } from '../style'

export const Cell = styled('div', {
  display: 'flex',
  position: 'relative',
  flexDirection: 'column',
  borderRadius: '$md',

  variants: {
    active: {
      true: {
        opacity: 1,
      },
      false: {
        opacity: 0.76,
      },
    },
    showBorder: {
      true: {
        border: '2px solid $primary',
      },
      false: {
        border: '2px solid transparent',
      },
    },
  },
})
