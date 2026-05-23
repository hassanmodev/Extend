import type { ExtendSettings } from "../utils/global"

export const BAD_DIRECTORIES = ["git", "node_modules"]
export const IGNORED_PATTERN = /node_modules|\.git/
export const RULES_FILE_NAME = "_extend.js"
export const EXTENSIONS = [["xt"], ["xt", "js"]] as const

export const DEFAULT_SETTINGS: ExtendSettings = {
  srcFolder: "t1",
  distFolder: "t2",
  codeOpening: "`{{",
  codeClosing: "}}`",
  variableOpening: "{",
  variableClosing: "}",
  arrayOpening: "[",
  arrayClosing: "]",
  escapeCharacter: "#",
  vscodeHighlighting: true,
}

export const SAVE_DEBOUNCE_MS = 50
export const MAX_RULES_RELOAD_ATTEMPTS = 15

export type CompileTarget = false | "rules" | "xt" | "xt.js"
export type WatchFolders = [string, string]
