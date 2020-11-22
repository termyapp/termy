import { styled } from '../../stitches.config'

export const Button = styled.button({
  px: '$4',
  py: '$2',
  mx: '$2',
  fontWeight: '$medium',
  letterSpacing: '$wide',
  backgroundColor: '$black',
  borderRadius: '$md',
  color: '$white',
  border: 'none',
  textDecoration: 'none',
  cursor: 'pointer',
  fontFamily: '$mono',

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
