import path = require("path")
import { BAD_DIRECTORIES, EXTENSIONS, type CompileTarget, type WatchFolders } from "./config"

export const isBadPath = (fileName: string) => {
  const badFileReg = new RegExp(`${BAD_DIRECTORIES.join("|")}`)
  return Boolean(fileName.match(badFileReg))
}

export const getRelativeFromSrc = (fileName: string, srcFolder: string) => {
  const srcPath = path.join(process.cwd(), srcFolder)
  return fileName.replace(srcPath, "")
}

export const getOutputPath = (fileName: string, folders: WatchFolders) => {
  const relativePath = getRelativeFromSrc(fileName, folders[0])
  return path.join(folders[1], relativePath)
}

export const getCompileTarget = (
  fileName: string,
  rulesFileName: string
): CompileTarget => {
  const nameList = fileName.split(".")
  if (path.basename(fileName) === rulesFileName) return "rules"
  if (nameList.slice(-1).join() === EXTENSIONS[0].join()) return "xt"
  if (nameList.slice(-2).join() === EXTENSIONS[1].join()) return "xt.js"
  return false
}

export const resolveOutputJsPath = (writeName: string, target: "xt" | "xt.js") => {
  let outputPath = writeName
  if (target === "xt.js") outputPath = outputPath.replace(".xt", "")
  return outputPath.replace(path.extname(outputPath), ".js")
}
