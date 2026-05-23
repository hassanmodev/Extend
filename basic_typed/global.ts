import type { UserRule } from "./compile"

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
  var msg: (...msgs: unknown[]) => void
  var settings: ExtendSettings
  var settingsFile: ExtendSettingsFile
}

export {}
