// next up better var detection
// handle deleted files
import "./utils/global"
export type { SettingsFile } from "./watch/settings-loader"
import { parseCli, runCliActions } from "./watch/cli"
import { initGlobalSettings } from "./watch/settings-loader"
import { createFileWatcher, startWatching } from "./watch/watcher"

initGlobalSettings()

const cliOptions = parseCli()
runCliActions(cliOptions)

const watcher = createFileWatcher()
startWatching(watcher)
