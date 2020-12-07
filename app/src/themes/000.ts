import baseTheme from '../base-theme'

export const darkTheme = {
  ...baseTheme,
  colors: {
    ...baseTheme.colors,

    $background: '#000',
    $foreground: baseTheme.colors.$white,
    $secondaryForeground: baseTheme.colors.$gray400,

    $accent: baseTheme.colors.$gray900,
    $caret: baseTheme.colors.$teal500,
    $selection: baseTheme.colors.$teal200,

    $focusedBackground: baseTheme.colors.$black,
    $focusedForeground: baseTheme.colors.$white,
    $runningBackground: baseTheme.colors.$blue100,
    $runningForeground: baseTheme.colors.$blue700,
    $successBackground: baseTheme.colors.$teal100,
    $successForeground: baseTheme.colors.$teal600,
    $errorBackground: baseTheme.colors.$red200,
    $errorForeground: baseTheme.colors.$red600,

    $currentDirForeground: baseTheme.colors.$teal900,
    $currentDirBackground: baseTheme.colors.$white,

    $focusedSuggestionBackground: baseTheme.colors.$blue600,
    $focusedSuggestionForeground: baseTheme.colors.$white,
  },
}
