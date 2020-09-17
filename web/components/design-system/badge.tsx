import { styled } from '../../stitches.config'

export const Badge = styled.span({
  backgroundColor: '$gray200',
  borderRadius: '$pill',
  color: '$gray600',
  height: '$3',
  px: '$1',
  fontSize: '$1',
  whiteSpace: 'nowrap',

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
        backgroundColor: '$blue200',
        color: '$blue600',
      },
      green: {
        backgroundColor: '$green200',
        color: '$green600',
      },
      red: {
        backgroundColor: '$red200',
        color: '$red600',
      },
      yellow: {
        backgroundColor: '$yellow200',
        color: '$yellow600',
      },
    },
  },
})
