import { styled } from '../stitches.config'

export const Button = styled.button({
  backgroundColor: '$foreground',
  border: 'none',
  borderRadius: '$2',
  color: '$background',
  px: '$5',
  py: '$1',
  fontSize: '$3',
  lineHeight: 'normal',
  cursor: 'pointer',
  fontWeight: 500,

  ':disabled': {
    pointerEvents: 'none',
    cursor: 'not-allowed',
  },

  variants: {
    variant: {
      blue: {
        backgroundColor: '$blue500',
        color: 'white',

        ':hover': {
          backgroundColor: '$blue600',
        },
        ':active': {
          backgroundColor: '$blue600',
        },
      },
    },
  },
})
