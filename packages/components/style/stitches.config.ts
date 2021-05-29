import { createCss } from '@stitches/react'
import { dark, light } from './theme'

export const { styled, css, global, keyframes, getCssString, theme } = createCss({
  theme: light,
  utils: {
    // Abbreviated margin properties
    m: config => value => ({
      marginTop: value,
      marginBottom: value,
      marginLeft: value,
      marginRight: value,
    }),
    mt: config => value => ({
      marginTop: value,
    }),
    mr: config => value => ({
      marginRight: value,
    }),
    mb: config => value => ({
      marginBottom: value,
    }),
    ml: config => value => ({
      marginLeft: value,
    }),
    mx: config => value => ({
      marginLeft: value,
      marginRight: value,
    }),
    my: config => value => ({
      marginTop: value,
      marginBottom: value,
    }),

    // A property for applying width/height together
    size: config => value => ({
      width: value,
      height: value,
    }),

    // A property to apply linear gradient
    linearGradient: config => value => ({
      backgroundImage: `linear-gradient(${value})`,
    }),

    // An abbreviated property for border-radius
    br: config => value => ({
      borderRadius: value,
    }),
  },
  media: {
    sm: '(min-width: 640px)',
    md: '(min-width: 768px)',
    lg: '(min-width: 1024px)',
    xl: '(min-width: 1280px)',
    '2xl': '(min-width: 1536px)',
  },
})

export const darkTheme = theme(dark)
