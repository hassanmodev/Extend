import type { Token } from "../core/parse"

export type TemplateToken = Token & {
  name?: string
  array?: Token[]
}

export type VarsDict = { [key: string]: string | VarsDict[] }

export type UserRule = {
  id: string,
  template: string,
  output: (variables: VarsDict | VarsDict[]) => string | false,
  parsed: TemplateToken[]
}
