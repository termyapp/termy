import { useMonaco } from '@monaco-editor/react'
import { useGlobalShortcuts, useWindowInfo } from '@src/hooks'
import { darkTheme, globalStyles } from '@termy/ui'
import useStore, { themeSelector } from '@src/store'
import { getThemeData, loadMonaco } from '@src/utils'
import React, { useEffect } from 'react'
import { TERMY } from './input'
import Tabs from './tabs'

loadMonaco()

export default function Termy() {
  globalStyles()

  const theme = useStore(themeSelector)
  useEffect(() => {
    // light is the default theme
    document.body.className = theme === 'light' ? '' : darkTheme
  }, [theme])

  // init monaco
  const monaco = useMonaco()

  // update monaco theme
  useEffect(() => {
    monaco?.editor.defineTheme(TERMY, getThemeData())
    monaco?.editor.setTheme(TERMY) // force re-render
  }, [theme, monaco])

  useWindowInfo()
  useGlobalShortcuts()

  // composition: Tabs -> Tab (only displaying active Tab) -> Cell(s)
  return <Tabs />
}
