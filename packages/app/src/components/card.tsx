import { styled } from '../stitches.config'

export const Card = styled.div({
  borderRadius: '$default',
  display: 'inline-block',

  variants: {
    type: {
      success: {},
    },
  },
})
