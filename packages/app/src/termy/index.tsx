import { useMonaco } from '@monaco-editor/react'
import { useGlobalShortcuts, useWindowInfo } from '@src/hooks'
import { css, globalStyles } from '@src/stitches.config'
import useStore, { themeSelector } from '@src/store'
import { getThemeData, loadMonaco } from '@src/utils'
import React, { useEffect, useMemo } from 'react'
import { TERMY } from './input'
import Tabs from './tabs'

loadMonaco()

export default function Termy() {
  const theme = useStore(themeSelector)

  useMemo(() => globalStyles(), [])
  const themeClass = useMemo(() => css.theme(theme), [theme])

  useEffect(() => {
    document.body.className = themeClass
  }, [themeClass])

  const monaco = useMonaco()

  // update monaco theme
  useEffect(() => {
    monaco?.editor.defineTheme(TERMY, getThemeData(theme))
    monaco?.editor.setTheme(TERMY) // force re-render
  }, [theme, monaco])

  useWindowInfo()
  useGlobalShortcuts()

  // composition: Tabs -> Tab (only displaying active Tab) -> Cell(s)
  return <Tabs />
}
