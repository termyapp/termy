import baseTheme from '../base-theme'

export const lightTheme = {
  ...baseTheme,
  colors: {
    ...baseTheme.colors,

    base: 'vs',

    $background: '#fff',
    $foreground: baseTheme.colors.$gray700,
    $secondaryForeground: baseTheme.colors.$gray700,

    $accent: baseTheme.colors.$gray500,
    $caret: baseTheme.colors.$teal500,
    $selection: baseTheme.colors.$teal200,

    $focusedBackground: baseTheme.colors.$white,
    $focusedForeground: baseTheme.colors.$black,
    $runningBackground: baseTheme.colors.$gray200,
    $runningForeground: baseTheme.colors.$gray700,
    $successBackground: baseTheme.colors.$teal200,
    $successForeground: baseTheme.colors.$teal600,
    $errorBackground: baseTheme.colors.$red200,
    $errorForeground: baseTheme.colors.$red600,

    $currentDirForeground: baseTheme.colors.$teal900,
    $currentDirBackground: baseTheme.colors.$white,

    $focusedSuggestionBackground: baseTheme.colors.$blue400,
    $focusedSuggestionForeground: baseTheme.colors.$white,
  },
}
