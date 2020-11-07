import { styled } from '../../stitches.config'

export const Text = styled.span({
  variants: {
    size: {
      '1': {
        fontSize: '$1',
      },
      '2': {
        fontSize: '$2',
      },
      '3': {
        fontSize: '$3',
      },
      '4': {
        fontSize: '$3',

        bp2: {
          fontSize: '$4',
        },
      },
      '5': {
        fontSize: '$5',
      },
      '6': {
        fontSize: '$6',
        letterSpacing: '-.012em',
      },
      '7': {
        fontSize: '$7',
        letterSpacing: '-.021em',

        bp2: {
          fontSize: '$7',
        },
      },
      '8': {
        fontSize: '$8',
        letterSpacing: '-.034em',
      },
      '9': {
        fontSize: '70px',
        letterSpacing: '-.055em',

        bp2: {
          fontSize: '90px',
        },
      },
    },
  },
})
