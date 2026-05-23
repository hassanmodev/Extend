const beautify = require("js-beautify")
const fse = require("fs-extra")
const fs = require("fs")
import { msg } from "./logger"

export const writeOutput = (processed: string, fileName: string) => {
  if (!processed) return msg(`${fileName}: got nothing to write.`)
  fse.outputFileSync(fileName, beautify(processed))
  msg("Success.")
}

export const copySource = (sourcePath: string, outputPath: string) => {
  writeOutput(fs.readFileSync(sourcePath).toString(), outputPath)
}

export const deleteOutput = (fileName: string) => {
  fs.unlink(fileName, (error: NodeJS.ErrnoException) => {
    if (error) {
      if (error.code === "ENOENT") return
      return console.log("delete error", { ...error })
    }
    msg("Deleted.")
  })
}
