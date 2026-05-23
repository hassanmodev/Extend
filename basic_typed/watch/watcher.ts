import path = require("path")
import type { FSWatcher } from "chokidar"
import "../utils/global"
import { IGNORED_PATTERN } from "./config"
import { createCompileHandler, type WatchRuntime } from "./compile-handler"
import { deleteOutput } from "./file-writer"
import { msg } from "./logger"
import { getOutputPath } from "./paths"
import {
  loadSettingsFile,
  loadUserRules,
  mergeSettings,
  resolveWatchPaths,
} from "./settings-loader"

const chokidar = require("chokidar")

export const createFileWatcher = (): FSWatcher =>
  chokidar.watch("file or dir", {
    ignored: IGNORED_PATTERN,
    persistent: true,
  })

export const startWatching = (watcher: FSWatcher) => {
  msg("Started..")

  const { rulesFileName, rulesFullPath } = resolveWatchPaths()
  const userRules = loadUserRules(rulesFullPath)
  const settingsFile = loadSettingsFile(rulesFullPath)
  const settings = mergeSettings(settingsFile)
  const folders: WatchRuntime["folders"] = [settings.srcFolder, settings.distFolder]
  const srcDirectory = path.join(process.cwd(), folders[0])

  global.settings = settings

  const runtime: WatchRuntime = {
    folders,
    rulesFileName,
    rulesFullPath,
    userRules,
  }

  const compileHandler = createCompileHandler(runtime)

  watcher
    .on("add", compileHandler)
    .on("change", compileHandler)
    .on("unlink", (fileName: string) =>
      deleteOutput(getOutputPath(fileName, folders))
    )
    .on("error", (error: Error) => {
      console.log("An error has occured error...\n", error)
    })

  watcher.add(srcDirectory)
  watcher.add(path.join(process.cwd(), rulesFileName))
}
