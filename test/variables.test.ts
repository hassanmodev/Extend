import { describe, expect, it } from 'vitest'
import '../basic_typed/utils/global'
import { parseTemplate, parseCode, Token } from '../basic_typed/core/parse'
import { getVariables } from '../basic_typed/core/variables'
import type { UserRule, VarsDict } from '../basic_typed/utils/types'

function makeRule(template: string): UserRule {
  const parsed = parseTemplate(template)
  return { id: 'test', template, output: () => 'x', parsed }
}

describe('getVariables array', () => {
  it('extracts repeating html attribute pairs', () => {
    const rule = makeRule('<{tag} {attrs}[{name}="{val}"]/>')
    const tok = parseCode('<input id="a" class="b" />')

    expect(getVariables(rule, tok, [] as Token[])).toEqual({
      tag: 'input ',
      attrs: [
        { name: 'id', val: 'a' },
        { name: 'class', val: 'b' },
      ],
    })
  })

  it('extracts a single array repetition', () => {
    const rule = makeRule('<{tag} {attrs}[{name}="{val}"]/>')
    const tok = parseCode('<div title="hello" />')

    const vars = getVariables(rule, tok, [] as Token[]) as VarsDict
    expect(vars.tag).toBe('div ')
    expect(vars.attrs).toEqual([{ name: 'title', val: 'hello' }])
  })

  it('returns false when trailing literals do not match', () => {
    const rule = makeRule('<{tag} {attrs}[{name}="{val}"]/>')
    const tok = parseCode('<input id="a"')

    expect(getVariables(rule, tok, [] as Token[])).toBe(false)
  })

  it('extracts multiple attrs when values contain slashes', () => {
    const rule = makeRule('<{tag} {attrs}[{name}="{val}"]/>')
    const tok = parseCode('<a href="/x" target="_blank" rel="noopener" />')

    expect(getVariables(rule, tok, [] as Token[])).toEqual({
      tag: 'a ',
      attrs: [
        { name: 'href', val: '/x' },
        { name: 'target', val: '_blank' },
        { name: 'rel', val: 'noopener' },
      ],
    })
  })

  it('extracts attr values that contain /> inside quotes', () => {
    const rule = makeRule('<{tag} {attrs}[{name}="{val}"]/>')
    const tok = parseCode('<a data="foo/>bar" />')

    expect(getVariables(rule, tok, [] as Token[])).toEqual({
      tag: 'a ',
      attrs: [{ name: 'data', val: 'foo/>bar' }],
    })
  })
})
