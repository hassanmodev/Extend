import type { Token } from "../core/parse"

export type TemplateToken = Token & {
  name?: string
  array?: Token[]
}

export type VarsDict = { [key: string]: string }

export type UserRule = {
  template: string,
  output: (variables: VarsDict | VarsDict[]) => string | false,
  parsed: TemplateToken[]
}
