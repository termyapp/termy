import { styled } from '../../stitches.config'

export const Container = styled.div({
  ml: 'auto',
  mr: 'auto',
  px: '$5',

  variants: {
    size: {
      '1': {
        maxWidth: '300px',
      },
      '2': {
        maxWidth: '585px',
      },
      '3': {
        maxWidth: '865px',
      },
      '4': {
        maxWidth: '1145px',
      },
      '5': {
        maxWidth: 'none',
      },
    },
  },
})
