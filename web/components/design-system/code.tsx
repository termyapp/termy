import { styled } from '../../stitches.config'

export const Code = styled.code({
  backgroundColor: '$purple200',
  color: '$purple600',
  fontFamily: '$mono',
  fontSize: 'max(12px, 85%)',
  whiteSpace: 'nowrap',

  variants: {
    size: {
      large: {
        px: '$3',
        fontSize: '$2',
      },
    },
    variant: {
      blue: {
        backgroundColor: '$blue200',
        color: '$blue600',
      },
      green: {
        backgroundColor: '$green200',
        color: '$green600',
      },
    },
  },
})
