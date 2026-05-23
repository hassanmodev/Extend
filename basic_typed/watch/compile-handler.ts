import type { UserRule } from "../utils/types"
import {
  SAVE_DEBOUNCE_MS,
  type WatchFolders,
} from "./config"
import { copySource, writeOutput } from "./file-writer"
import {
  getCompileTarget,
  getOutputPath,
  getRelativeFromSrc,
  isBadPath,
  resolveOutputJsPath,
} from "./paths"
import { msg } from "./logger"
import { loadUserRules } from "./settings-loader"

const fs = require("fs")
const compileModule = require("../core/compile")

export type WatchRuntime = {
  folders: WatchFolders
  rulesFileName: string
  rulesFullPath: string
  userRules: UserRule[]
}

export const compile = async (
  runtime: WatchRuntime,
  fileName: string
): Promise<void> => {
  if (isBadPath(fileName)) {
    return console.log("bad dir")
  }

  const outputPath = getOutputPath(fileName, runtime.folders)
  const compileTarget = getCompileTarget(fileName, runtime.rulesFileName)

  if (compileTarget === "rules") {
    runtime.userRules = loadUserRules(runtime.rulesFullPath)
    msg("Updated rules.")
    return
  }

  if (!compileTarget) {
    return copySource(fileName, outputPath)
  }

  let sourceCode: string
  try {
    sourceCode = fs.readFileSync(fileName).toString()
  } catch {
    console.log(
      `An error has occured, please make sure file ${fileName} exists.`
    )
    return
  }

  const relativeName = getRelativeFromSrc(fileName, runtime.folders[0]).slice(1)
  let value = compileModule.processCode(
    sourceCode,
    runtime.userRules,
    relativeName
  ).text

  writeOutput(
    value,
    resolveOutputJsPath(outputPath, compileTarget)
  )
}

export const createCompileHandler = (runtime: WatchRuntime) => {
  return async (fileName: string) => {
    await new Promise((resolve) => setTimeout(resolve, SAVE_DEBOUNCE_MS))
    await compile(runtime, fileName)
  }
}
