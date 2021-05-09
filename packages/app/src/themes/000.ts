import baseTheme from '../base-theme'

export const darkTheme = {
  ...baseTheme,
  colors: {
    ...baseTheme.colors,

    base: 'vs-dark',

    $background: '#000',
    $foreground: baseTheme.colors.$white,
    $secondaryForeground: baseTheme.colors.$gray400,

    $accent: baseTheme.colors.$gray800,
    $caret: baseTheme.colors.$pink500,
    $selection: baseTheme.colors.$pink500,

    $focusedBackground: baseTheme.colors.$black,
    $focusedForeground: baseTheme.colors.$white,
    $runningBackground: baseTheme.colors.$gray900,
    $runningForeground: baseTheme.colors.$gray400,
    $successBackground: baseTheme.colors.$teal900,
    $successForeground: baseTheme.colors.$teal400,
    $errorBackground: baseTheme.colors.$red900,
    $errorForeground: baseTheme.colors.$red400,

    $currentDirForeground: baseTheme.colors.$pink900,
    $currentDirBackground: baseTheme.colors.$white,

    $focusedSuggestionBackground: baseTheme.colors.$blue600,
    $focusedSuggestionForeground: baseTheme.colors.$white,
  },
}
