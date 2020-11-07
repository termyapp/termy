import { createStyled } from '@stitches/react'

export const theme = {
  colors: {
    $foreground: 'black',
    $background: '#EBECF3', // todo: dark

    $canvas: 'hsl(0,0%,93%)',

    $gray100: 'hsl(206,22%,99%)',
    $gray200: 'hsl(206,12%,97%)',
    $gray300: 'hsl(206,11%,92%)',
    $gray400: 'hsl(206,10%,84%)',
    $gray500: 'hsl(206,10%,76%)',
    $gray600: 'hsl(206,10%,44%)',
    $gray700: 'hsl(206,5%,38%)',

    $blue100: 'hsl(206,100%,99%)',
    $blue200: 'hsl(206,100%,97%)',
    $blue300: 'hsl(206,100%,92%)',
    $blue400: 'hsl(206,100%,84%)',
    $blue500: 'hsl(206,100%,50%)',
    $blue600: 'hsl(212,100%,47%)',

    $purple100: 'hsl(252,100%,99%)',
    $purple200: 'hsl(252,100%,98%)',
    $purple300: 'hsl(252,100%,94%)',
    $purple400: 'hsl(252,75%,84%)',
    $purple500: 'hsl(252,78%,60%)',
    $purple600: 'hsl(252,80%,53%)',

    $green100: 'hsl(152,75%,98%)',
    $green200: 'hsl(152,72%,95%)',
    $green300: 'hsl(150,60%,86%)',
    $green400: 'hsl(150,60%,78%)',
    $green500: 'hsl(148,60%,60%)',
    $green600: 'hsl(148,58%,32%)',

    $red100: 'hsl(346,100%,98%)',
    $red200: 'hsl(346,94%,97%)',
    $red300: 'hsl(348,90%,91%)',
    $red400: 'hsl(350,90%,85%)',
    $red500: 'hsl(352,100%,62%)',
    $red600: 'hsl(352,79%,48%)',

    $yellow100: 'hsl(42,100%,98%)',
    $yellow200: 'hsl(50,98%,95%)',
    $yellow300: 'hsl(52,92%,86%)',
    $yellow400: 'hsl(52,92%,74%)',
    $yellow500: 'hsl(52,100%,49%)',
    $yellow600: 'hsl(42,54%,36%)',
  },
  fonts: {
    $sans:
      'HelveticaNeue, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
    $mono:
      '"Courier New", Courier, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
  },
  space: {
    $1: '3px',
    $2: '7px',
    $3: '15px',
    $4: '20px',
    $5: '25px',
    $6: '35px',
    $7: '45px',
    $8: '65px',
    $9: '80px',
  },
  sizes: {
    $1: '5px',
    $2: '8px',
    $3: '15px',
    $4: '20px',
    $5: '25px',
    $6: '35px',
    $7: '45px',
    $8: '65px',
    $9: '80px',
  },
  fontSizes: {
    $1: '12px',
    $2: '13px',
    $3: '15px',
    $4: '17px',
    $5: '19px',
    $6: '21px',
    $7: '27px',
    $8: '35px',
    $9: '59px',
  },
  radii: {
    $1: '3px',
    $2: '5px',
    $3: '10px',
    $round: '50%',
    $pill: '9999px',
  },
  zIndices: {
    $1: '100',
    $2: '200',
    $3: '300',
    $4: '400',
    $max: '999',
  },
}

export const darkTheme = {
  $foreground: 'hsl(206,2%,93%)',
  $background: 'rgb(10, 10, 30)',

  $canvas: 'hsl(0,0%,15%)',

  $gray100: 'hsl(206,8%,7%)',
  $gray200: 'hsl(206,7%,11%)',
  $gray300: 'hsl(206,7%,15%)',
  $gray400: 'hsl(206,7%,24%)',
  $gray500: 'hsl(206,7%,30%)',
  $gray600: 'hsl(206,5%,53%)',
  $gray700: 'hsl(206,5%,65%)',

  $blue100: 'hsl(212,100%,10%)',
  $blue200: 'hsl(212,42%,12%)',
  $blue300: 'hsl(211,55%,16%)',
  $blue400: 'hsl(209,100%,84%)',
  $blue500: 'hsl(206,100%,50%)',
  $blue600: 'hsl(206,100%,60%)',

  $purple100: 'hsl(252,50%,10%)',
  $purple200: 'hsl(252,22%,14%)',
  $purple300: 'hsl(252,33%,20%)',
  $purple400: 'hsl(252,75%,84%)',
  $purple500: 'hsl(252,78%,60%)',
  $purple600: 'hsl(252,78%,71%)',

  $green100: 'hsl(152,75%,8%)',
  $green200: 'hsl(152,72%,11%)',
  $green300: 'hsl(150,60%,20%)',
  $green400: 'hsl(150,60%,40%)',
  $green500: 'hsl(148,60%,50%)',
  $green600: 'hsl(148,58%,60%)',

  $red100: 'hsl(346,100%,8%)',
  $red200: 'hsl(346,94%,13%)',
  $red300: 'hsl(348,90%,20%)',
  $red400: 'hsl(350,90%,40%)',
  $red500: 'hsl(352,100%,50%)',
  $red600: 'hsl(352,79%,65%)',

  $yellow100: 'hsl(52,50%,10%)',
  $yellow200: 'hsl(52,22%,14%)',
  $yellow300: 'hsl(52,33%,20%)',
  $yellow400: 'hsl(52,75%,78%)',
  $yellow500: 'hsl(52,78%,45%)',
  $yellow600: 'hsl(52,90%,45%)',
} as const

export const { styled, css } = createStyled({
  tokens: theme,
  breakpoints: {
    default: rule => rule,
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

    ta: value => ({ textAlign: value }),

    fd: value => ({ flexDirection: value }),
    fw: value => ({ flexWrap: value }),

    ai: value => ({ alignItems: value }),
    ac: value => ({ alignContent: value }),
    jc: value => ({ justifyContent: value }),
    as: value => ({ alignSelf: value }),
    fg: value => ({ flexGrow: value }),
    fs: value => ({ flexShrink: value }),
    fb: value => ({ flexBasis: value }),

    bc: (value: keyof typeof theme['colors'] | (string & {})) => ({
      backgroundColor: value,
    }),
    //
    br: (value: keyof typeof theme['radii'] | (string & {})) => ({
      borderRadius: value,
    }),
    // btrr: (value: keyof typeof theme['radii'] | (string & {})) => ({
    //   borderTopRightRadius: value,
    // }),
    // bbrr: (value: keyof typeof theme['radii'] | (string & {})) => ({
    //   borderBottomRightRadius: value,
    // }),
    // bblr: (value: keyof typeof theme['radii'] | (string & {})) => ({
    //   borderBottomLeftRadius: value,
    // }),
    // btlr: (wvalue: keyof typeof theme['radii'] | (string & {})) => ({
    //   borderTopLeftRadius: value,
    // }),

    bs: value => ({ boxShadow: value }),

    lh: value => ({ lineHeight: value }),

    ox: value => ({ overflowX: value }),
    oy: value => ({ overflowY: value }),

    pe: value => ({ pointerEvents: value }),
    us: value => ({ userSelect: value }),

    // size: (value: keyof typeof theme['sizes'] | (string & {})) => ({
    //   width: value,
    //   height: value,
    // }),

    linearGradient: value => ({
      backgroundImage: `linear-gradient(${value})`,
    }),
  },
})

export const darkThemeClass = css.theme({ colors: darkTheme })
