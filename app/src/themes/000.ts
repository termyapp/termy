import baseTheme from '../base-theme'

export const darkTheme = {
  ...baseTheme,
  colors: {
    ...baseTheme.colors,

    base: 'vs-dark',

    $background: '#000',
    $foreground: baseTheme.colors.$white,
    $secondaryForeground: baseTheme.colors.$gray400,

    $accent: baseTheme.colors.$gray700,
    $caret: baseTheme.colors.$pink500,
    $selection: baseTheme.colors.$pink500,

    $focusedBackground: baseTheme.colors.$black,
    $focusedForeground: baseTheme.colors.$white,
    $runningBackground: baseTheme.colors.$blue100,
    $runningForeground: baseTheme.colors.$blue700,
    $successBackground: baseTheme.colors.$pink100,
    $successForeground: baseTheme.colors.$pink600,
    $errorBackground: baseTheme.colors.$red200,
    $errorForeground: baseTheme.colors.$red600,

    $currentDirForeground: baseTheme.colors.$pink900,
    $currentDirBackground: baseTheme.colors.$white,

    $focusedSuggestionBackground: baseTheme.colors.$blue600,
    $focusedSuggestionForeground: baseTheme.colors.$white,
  },
}
