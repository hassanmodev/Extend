import { describe, expect, it } from 'vitest'
import '../utils/global'
import { parseCode, parseTemplate } from './parse'
import { getVariables } from './variables'
import type { UserRule } from '../utils/types'

describe('array end edge cases', () => {
  it('does not treat /> inside quoted attr value as array end', () => {
    const rule: UserRule = {
      template: '<{tag} {attrs}[{name}="{val}"]/>',
      output: () => 'x',
      parsed: parseTemplate('<{tag} {attrs}[{name}="{val}"]/>'),
    }
    const tok = parseCode('<a data="foo/>bar" />')

    expect(getVariables(rule, tok, [])).toEqual({
      tag: 'a ',
      attrs: [{ name: 'data', val: 'foo/>bar' }],
    })
  })

  it('does not treat ] inside quoted attr value as array end', () => {
    const rule: UserRule = {
      template: '<{tag} {attrs}[{name}="{val}"]/>',
      output: () => 'x',
      parsed: parseTemplate('<{tag} {attrs}[{name}="{val}"]/>'),
    }
    const tok = parseCode('<div data="[a]" title="b" />')

    expect(getVariables(rule, tok, [])).toEqual({
      tag: 'div ',
      attrs: [
        { name: 'data', val: '[a]' },
        { name: 'title', val: 'b' },
      ],
    })
  })
})
