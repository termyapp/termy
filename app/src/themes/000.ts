import baseTheme from '../base-theme'

export const darkTheme = {
  ...baseTheme,
  colors: {
    ...baseTheme.colors,

    $primaryTextColor: baseTheme.colors.$white,
    $secondaryTextColor: baseTheme.colors.$gray400,
    $backgroundColor: baseTheme.colors.$black,

    $accent: '#2a2a2a',
    $caret: '#f42069',
    $selection: '#f42069',
    $focusedBackgroundColor: '#161616',

    $currentDirColor: baseTheme.colors.$gray300,
    $currentDirBackgroundColor: baseTheme.colors.$gray900,

    $selectedSuggestionBackgroundColor: baseTheme.colors.$blue700,
    $selectedSuggestionColor: baseTheme.colors.$white,
  },
}
