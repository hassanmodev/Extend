const commandLineArgs = require("command-line-args")
const fse = require("fs-extra")
import * as example from "../utils/example"

const optionDefinitions = [
  { name: "help", alias: "h", type: Boolean },
  { name: "start", alias: "s", type: Boolean },
  { name: "other", defaultOption: true, type: String },
]

export type CliOptions = {
  help?: boolean
  start?: boolean
  other?: string
}

export const parseCli = (): CliOptions => {
  try {
    return commandLineArgs(optionDefinitions)
  } catch (error) {
    const e = error as { optionName?: string }
    console.log("Unknown argument", e.optionName)
    console.log("Use -h for instructions.")
    process.exit()
  }
}

export const runCliActions = (options: CliOptions) => {
  if (options.help) {
    console.log(
      "use --start or -s to create a basic example, \nPlease refer to https://github.com/se7smohamed/Extend for further help."
    )
    process.exit()
  }

  if (options.start) {
    console.log("Creating a Hello World example.")
    example.text.forEach((file) => {
      fse.outputFileSync(file.file, file.text)
    })
  }
}
