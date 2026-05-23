import type { UserRule } from "./types"

export type ExtendSettings = {
  srcFolder: string
  distFolder: string
  codeOpening: string
  codeClosing: string
  variableOpening: string
  variableClosing: string
  arrayOpening: string
  arrayClosing: string
  escapeCharacter: string
  vscodeHighlighting: boolean
}

export type TypeFilter = RegExp | ((value: string) => unknown)

export type ExtendSettingsFile = {
  rules: UserRule[]
  settings: ExtendSettings
  types: Record<string, TypeFilter>
}

declare global {
  var settings: ExtendSettings
  var settingsFile: ExtendSettingsFile
}

export {}
