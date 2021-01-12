import baseTheme from '../base-theme'

export const lightTheme = {
  ...baseTheme,
  colors: {
    ...baseTheme.colors,

    base: 'vs',

    $background: '#f7f7f9',
    $foreground: baseTheme.colors.$gray700,
    $secondaryForeground: baseTheme.colors.$gray700,

    $accent: baseTheme.colors.$gray400,
    $caret: baseTheme.colors.$teal500,
    $selection: baseTheme.colors.$teal200,

    $focusedBackground: baseTheme.colors.$white,
    $focusedForeground: baseTheme.colors.$black,
    $runningBackground: baseTheme.colors.$blue100,
    $runningForeground: baseTheme.colors.$blue700,
    $successBackground: baseTheme.colors.$teal100,
    $successForeground: baseTheme.colors.$teal600,
    $errorBackground: baseTheme.colors.$red200,
    $errorForeground: baseTheme.colors.$red600,

    $currentDirForeground: baseTheme.colors.$teal900,
    $currentDirBackground: baseTheme.colors.$white,

    $focusedSuggestionBackground: baseTheme.colors.$blue400,
    $focusedSuggestionForeground: baseTheme.colors.$white,
  },
}
