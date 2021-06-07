import { useGlobalShortcuts, useWindowInfo } from '@src/hooks'
import useStore, { themeSelector } from '@src/store'
import { initSuggestions, updateMonacoTheme } from '@src/utils'
import { theme as lightTheme, darkTheme, globalStyles } from '@termy/ui'
import React, { useEffect } from 'react'
import Tabs from './tabs'

initSuggestions()

export default function Termy() {
  globalStyles()

  // update theme
  const theme = useStore(themeSelector)
  useEffect(() => {
    document.body.className = theme === 'light' ? '' : darkTheme

    updateMonacoTheme(lightTheme.colors)
  }, [theme])

  useWindowInfo()
  useGlobalShortcuts()

  // composition: Tabs -> Tab (only displaying active Tab) -> Cell(s)
  return <Tabs />
}
