import { styled } from '../../stitches.config'

export const Link = styled.a({
  color: '$hiContrast',
  borderBottom: '1px solid $gray400',
  lineHeight: 'inherit',
  transition: 'all 50ms linear',
  ':hover': {
    borderColor: '$gray500',
  },
  variants: {
    size: {
      large: {
        height: '$5',
        px: '$3',
        fontSize: '$2',
      },
    },
    variant: {
      blue: {
        color: '$blue600',
        textDecoration: 'none',
        borderColor: 'transparent',
        ':hover': {
          borderColor: '$blue300',
        },
      },
      subtle: {
        color: '$gray600',
        borderColor: 'transparent',
        ':hover': {
          borderColor: '$gray300',
        },
      },
    },
  },
})
