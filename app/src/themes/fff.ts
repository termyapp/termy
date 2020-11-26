import baseTheme from '../base-theme'

export const lightTheme = {
  ...baseTheme,
  colors: {
    ...baseTheme.colors,

    $background: '#f3f3f3',
    $foreground: baseTheme.colors.$black,
    $secondaryForeground: baseTheme.colors.$gray700,

    $accent: baseTheme.colors.$gray400,
    $caret: baseTheme.colors.$teal500,
    $selection: baseTheme.colors.$teal200,

    $defaultBackground: baseTheme.colors.$white,
    $defaultForeground: baseTheme.colors.$gray900,
    $runningBackground: baseTheme.colors.$blue100,
    $runningForeground: baseTheme.colors.$blue800,
    $successBackground: baseTheme.colors.$green100,
    $successForeground: baseTheme.colors.$green900,
    $errorBackground: baseTheme.colors.$red200,
    $errorForeground: baseTheme.colors.$red900,

    $currentDirForeground: baseTheme.colors.$teal900,
    $currentDirBackground: baseTheme.colors.$white,

    $focusedSuggestionBackground: baseTheme.colors.$blue400,
    $focusedSuggestionForeground: baseTheme.colors.$white,
  },
}
