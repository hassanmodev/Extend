import "../utils/global"
import type { ExtendSettingsFile } from "../utils/global"
import type { UserRule } from "../utils/types"
import path = require("path")
import {
  DEFAULT_SETTINGS,
  MAX_RULES_RELOAD_ATTEMPTS,
  RULES_FILE_NAME,
} from "./config"

const highlight = require("../highlight")
const compileModule = require("../core/compile")

export type SettingsFile = ExtendSettingsFile

export const loadSettingsFile = (settingsFileName: string): SettingsFile => {
  try {
    Object.keys(require.cache).forEach((key) => {
      delete require.cache[key]
    })
    const settingsFile: SettingsFile = require(settingsFileName)
    global.settingsFile = { ...global.settingsFile, ...settingsFile || {} }
    global.settings = { ...global.settings, ...settingsFile.settings || {} }
    return settingsFile
  } catch {
    console.log(
      "rules file not found, make sure you have a valid _extend.js file at the current directory, run extendx -h for help"
    )
    process.exit()
  }
}

export const loadUserRules = (fileName: string): UserRule[] => {
  let settingsFile = loadSettingsFile(fileName)

  for (let i = 0; i < MAX_RULES_RELOAD_ATTEMPTS; i++) {
    if (!Object.keys(settingsFile).length) {
      settingsFile = loadSettingsFile(fileName)
    } else {
      break
    }
  }

  console.log(".>>>", settingsFile, Object.keys(settingsFile))

  const userRules = compileModule.handleRules(settingsFile)
  const markers = [settingsFile.settings.codeOpening, settingsFile.settings.codeClosing]
  highlight.start(userRules, markers)
  return userRules
}

export const initGlobalSettings = () => {
  global.settings = { ...DEFAULT_SETTINGS }
}

export const resolveWatchPaths = (cwd = process.cwd()) => ({
  rulesFileName: RULES_FILE_NAME,
  rulesFullPath: path.join(cwd, RULES_FILE_NAME),
})

export const mergeSettings = (settingsFile: SettingsFile) => ({
  ...DEFAULT_SETTINGS,
  ...settingsFile.settings,
})
