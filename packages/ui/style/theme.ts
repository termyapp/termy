// Tailwind base theme:
// https://github.com/tailwindlabs/tailwindcss/blob/master/stubs/defaultConfig.stub.js

// export const darkTheme = {
//     ...baseTheme,
//     colors: {
//       ...baseTheme.colors,

//       base: 'vs-dark',

//       $background: '#000',
//       $foreground: baseTheme.colors.$white,
//       $secondaryForeground: baseTheme.colors.$gray400,

//       $accent: baseTheme.colors.$gray800,
//       $caret: baseTheme.colors.$pink500,
//       $selection: baseTheme.colors.$pink500,

//       $focusedBackground: baseTheme.colors.$black,
//       $focusedForeground: baseTheme.colors.$white,
//       $runningBackground: baseTheme.colors.$gray900,
//       $runningForeground: baseTheme.colors.$gray400,
//       $successBackground: baseTheme.colors.$teal900,
//       $successForeground: baseTheme.colors.$teal400,
//       $errorBackground: baseTheme.colors.$red900,
//       $errorForeground: baseTheme.colors.$red400,

//       $currentDirForeground: baseTheme.colors.$pink900,
//       $currentDirBackground: baseTheme.colors.$white,

//       $focusedSuggestionBackground: baseTheme.colors.$blue600,
//       $focusedSuggestionForeground: baseTheme.colors.$white,
//     },
//   }

const base = {
  colors: {
    base: 'vs', // VSCode base theme

    background: '#FFFFFF',
    foreground: '#000000',

    primary: '#3B82F6',
    selection: '#BFDBFE',
  },
  space: {
    px: '1px',
    0: '0px',
    0.5: '0.125rem',
    1: '0.25rem',
    1.5: '0.375rem',
    2: '0.5rem',
    2.5: '0.625rem',
    3: '0.75rem',
    3.5: '0.875rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    7: '1.75rem',
    8: '2rem',
    9: '2.25rem',
    10: '2.5rem',
    11: '2.75rem',
    12: '3rem',
    14: '3.5rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    28: '7rem',
    32: '8rem',
    36: '9rem',
    40: '10rem',
    44: '11rem',
    48: '12rem',
    52: '13rem',
    56: '14rem',
    60: '15rem',
    64: '16rem',
    72: '18rem',
    80: '20rem',
    96: '24rem',
  },
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
    '6xl': '3.75rem',
    '7xl': '4.5rem',
    '8xl': '6rem',
    '9xl': '8rem',
  },
  // todo: inter, hack
  fonts: {
    sans: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
    mono: 'Menlo, Courier, Courier New, Monaco, Consolas, "Liberation Mono", monospace',
    serif: 'Georgia, Cambria, "Times New Roman", Times, serif',
  },
  fontWeights: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
  lineHeights: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
    3: '.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    7: '1.75rem',
    8: '2rem',
    9: '2.25rem',
    10: '2.5rem',
  },
  letterSpacings: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
  sizes: {},
  borderWidths: {
    px: '1px',
    0: '0px',
    2: '2px',
    4: '4px',
    8: '8px',
  },
  borderStyles: {},
  radii: {
    none: '0px',
    sm: '0.125rem',
    DEFAULT: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    none: 'none',
  },
  zIndices: {
    auto: 'auto',
    0: '0',
    10: '10',
    20: '20',
    30: '30',
    40: '40',
    50: '50',
  },
  transitions: {},
}

export const light = base

export const dark = {
  colors: {
    ...base.colors,

    base: 'vs-dark', // VSCode base theme

    background: '#000000',
    foreground: '#000000',
  },
}
