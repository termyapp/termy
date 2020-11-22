import { createStyled } from '@stitches/react'
import baseTheme from './base-theme'

export const lightTheme = {
  ...baseTheme,
  colors: {
    ...baseTheme.colors,

    $primaryTextColor: baseTheme.colors.$black,
    $secondaryTextColor: baseTheme.colors.$gray700,
    $backgroundColor: '#f5f5f7',

    $accentColor: baseTheme.colors.$gray300,
    $caretColor: baseTheme.colors.$teal500,
    $selectionColor: baseTheme.colors.$teal200,
    $focusedBackgroundColor: baseTheme.colors.$white,

    $currentDirColor: baseTheme.colors.$blue900,
    $currentDirBackgroundColor: baseTheme.colors.$gray200,

    $selectedSuggestionBackgroundColor: baseTheme.colors.$blue500,
    $selectedSuggestionColor: baseTheme.colors.$white,
  },
}

// creating a copy so that the exported `theme` retains the raw values
const tokens = JSON.parse(JSON.stringify(lightTheme)) as typeof lightTheme

export const { styled, css } = createStyled({
  // prefix: 'Termy',
  tokens,
  breakpoints: {
    default: rule => rule,
    mobile: rule => `@media (max-width: 900px) { ${rule} }`,
    bp1: rule => `@media (min-width: 520px) { ${rule} }`,
    bp2: rule => `@media (min-width: 900px) { ${rule} }`,
    bp3: rule => `@media (min-width: 1200px) { ${rule} }`,
    bp4: rule => `@media (min-width: 1800px) { ${rule} }`,
    motion: rule => `@media (prefers-reduced-motion) { ${rule} }`,
    hover: rule => `@media (hover: hover) { ${rule} }`,
    dark: rule => `@media (prefers-color-scheme: dark) { ${rule} }`,
    light: rule => `@media (prefers-color-scheme: light) { ${rule} }`,
  },
  utils: {
    p: value => ({
      paddingTop: value,
      paddingBottom: value,
      paddingLeft: value,
      paddingRight: value,
    }),
    pt: value => ({
      paddingTop: value,
    }),
    pr: value => ({
      paddingRight: value,
    }),
    pb: value => ({
      paddingBottom: value,
    }),
    pl: value => ({
      paddingLeft: value,
    }),
    px: value => ({
      paddingLeft: value,
      paddingRight: value,
    }),
    py: value => ({
      paddingTop: value,
      paddingBottom: value,
    }),

    m: value => ({
      marginTop: value,
      marginBottom: value,
      marginLeft: value,
      marginRight: value,
    }),
    mt: value => ({
      marginTop: value,
    }),
    mr: value => ({
      marginRight: value,
    }),
    mb: value => ({
      marginBottom: value,
    }),
    ml: value => ({
      marginLeft: value,
    }),
    mx: value => ({
      marginLeft: value,
      marginRight: value,
    }),
    my: value => ({
      marginTop: value,
      marginBottom: value,
    }),
  },
})

export const globalStyles = css.global({
  body: {
    color: '$primaryTextColor',
    backgroundColor: '$backgroundColor',
    caretColor: '$caretColor',
    fontFamily: '$sans',

    '*': {
      '::selection': {
        backgroundColor: '$selectionColor',
      },
    },

    a: {
      textDecoration: 'none',
    },
  },
})
