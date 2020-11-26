import { styled } from '../../stitches.config'

export const Card = styled.div({
  borderRadius: '$default',
  border: '1px solid $accent',
  px: '$4',
  py: '$3',

  variants: {
    type: {
      success: {
        backgroundColor: '$green100',
        color: '$green900',
        // border: '1px solid $green400',
      },
    },
  },
})
