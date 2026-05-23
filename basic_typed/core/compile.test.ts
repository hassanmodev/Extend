import '../utils/global'
import { describe, expect, it, vi } from 'vitest'
import { handleRules, processCode } from './compile'
import { parseTemplate } from './parse'
import type { ExtendSettingsFile } from '../utils/global'
import type { UserRule, VarsDict } from '../utils/types'

function makeRules(
  ...rules: Array<{ template: string; output: UserRule['output'] }>
): UserRule[] {
  return rules.map((rule) => ({
    ...rule,
    parsed: parseTemplate(rule.template),
  }))
}

const htmlAttrsTemplate = '<{tag} {attrs}[{name}="{val}"]/>'

function formatHtmlAttrs(vars: VarsDict | VarsDict[]) {
  const { tag, attrs } = vars as VarsDict
  const pairs = (attrs as VarsDict[])
    .map(({ name, val }) => `${name} ${val}`)
    .join(' ')
  return `${String(tag).trim()} ${pairs}`.trim()
}

describe('handleRules', () => {
  it('parses each rule template into parsed tokens', () => {
    const settingsFile: ExtendSettingsFile = {
      rules: [
        {
          template: '{name}',
          output: (vars) => (vars as VarsDict).name as string,
          parsed: [],
        },
      ],
      settings: {} as ExtendSettingsFile['settings'],
      types: {},
    }

    const rules = handleRules(settingsFile)

    expect(rules[0].parsed).toEqual(parseTemplate('{name}'))
  })

  it('parses templates for every rule in the file', () => {
    const settingsFile: ExtendSettingsFile = {
      rules: [
        { template: '{a}', output: () => 'a', parsed: [] },
        { template: 'foo {b}', output: () => 'b', parsed: [] },
      ],
      settings: {} as ExtendSettingsFile['settings'],
      types: {},
    }

    const rules = handleRules(settingsFile)

    expect(rules[0].parsed).toEqual(parseTemplate('{a}'))
    expect(rules[1].parsed).toEqual(parseTemplate('foo {b}'))
  })
})

describe('processCode', () => {
  it('passes through text outside code blocks', () => {
    const rules = makeRules({
      template: '{x}',
      output: (vars) => `(${(vars as VarsDict).x})`,
    })

    expect(processCode('plain text', rules).text).toBe('plain text')
  })

  it('finds a code block and compiles it', () => {
    const rules = makeRules({
      template: '{x}',
      output: (vars) => `(${(vars as VarsDict).x})`,
    })

    expect(processCode('`{{hello}}`', rules).text).toBe('(hello)')
  })

  it('keeps surrounding text and compiles the block in place', () => {
    const rules = makeRules({
      template: '{x}',
      output: (vars) => `(${(vars as VarsDict).x})`,
    })

    expect(processCode('before `{{hi}}` after', rules).text).toBe(
      'before (hi) after',
    )
  })

  it('compiles multiple blocks in one pass', () => {
    const rules = makeRules({
      template: '{x}',
      output: (vars) => `[${(vars as VarsDict).x}]`,
    })

    expect(processCode('a `{{1}}` b `{{2}}` c', rules).text).toBe(
      'a [1] b [2] c',
    )
  })

  it('extracts variables from block content using the rule template', () => {
    const rules = makeRules({
      template: 'foo {x}',
      output: (vars) => `bar-${(vars as VarsDict).x}`,
    })

    expect(processCode('`{{foo baz}}`', rules).text).toBe('bar-baz')
  })

  it('extracts multiple variables from one block', () => {
    const rules = makeRules({
      template: '{a} + {b}',
      output: (vars) => `${(vars as VarsDict).a}|${(vars as VarsDict).b}`,
    })

    expect(processCode('`{{1 + 2}}`', rules).text).toBe('1 |2')
  })

  it('compiles block content that includes symbols and parentheses', () => {
    const rules = makeRules({
      template: '{x}',
      output: (vars) => `(${(vars as VarsDict).x})`,
    })

    expect(processCode('`{{foo(bar)}}`', rules).text).toBe('(foo(bar))')
  })

  it('skips a rule when its literal prefix does not match', () => {
    const rules = makeRules(
      {
        template: 'nope {x}',
        output: () => 'wrong',
      },
      {
        template: '{x}',
        output: (vars) => `ok:${(vars as VarsDict).x}`,
      },
    )

    expect(processCode('`{{yes}}`', rules).text).toBe('ok:yes')
  })

  it('uses the first rule whose output is not false', () => {
    const rules = makeRules(
      { template: '{x}', output: () => false },
      { template: '{x}', output: (vars) => `ok:${(vars as VarsDict).x}` },
    )

    expect(processCode('`{{val}}`', rules).text).toBe('ok:val')
  })

  it('wraps unmatched block content in a comment', () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})
    const rules = makeRules({
      template: '{x}',
      output: () => false,
    })

    expect(processCode('`{{nomatch}}`', rules).text).toBe(
      '/* none of the rules matched nomatch*/',
    )

    log.mockRestore()
  })

  it('wraps blocks that match no rule template in a comment', () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})
    const rules = makeRules({
      template: 'expected {x}',
      output: (vars) => (vars as VarsDict).x as string,
    })

    expect(processCode('`{{unexpected}}`', rules).text).toBe(
      '/* none of the rules matched unexpected*/',
    )

    log.mockRestore()
  })

  it('passes fileName through to unmatched block handling', () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})
    const rules = makeRules({
      template: '{x}',
      output: () => false,
    })

    processCode('`{{x}}`', rules, 'file.ts')

    expect(log).toHaveBeenCalledWith('file.ts| none of the rules matched:x')

    log.mockRestore()
  })

  it('applies typed variable filters from global settings', () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})
    global.settingsFile = {
      rules: [],
      settings: {} as ExtendSettingsFile['settings'],
      types: { digit: /^\d+$/ },
    }

    const rules = makeRules({
      template: '{digit n}',
      output: (vars) => `num:${(vars as VarsDict).n}`,
    })

    expect(processCode('`{{42}}`', rules).text).toBe('num:42')
    expect(processCode('`{{abc}}`', rules).text).toBe(
      '/* none of the rules matched abc*/',
    )

    log.mockRestore()
  })

  it('recovers when a rule output throws', () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})
    const rules = makeRules({
      template: '{x}',
      output: () => {
        throw new Error('bad output')
      },
    })

    expect(processCode('`{{boom}}`', rules).text).toBe(
      '/* none of the rules matched boom*/',
    )
    expect(log).toHaveBeenCalled()

    log.mockRestore()
  })

  it('does not leak text after a nested block is compiled', () => {
    const rules = makeRules({
      template: '{x}',
      output: (vars) => `<${(vars as VarsDict).x}>`,
    })

    expect(processCode('`{{a `{{b}}` c}}`', rules).text).toBe('<a <b> c>')
  })

  it('treats an empty-string rule output as a successful match', () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})
    const rules = makeRules({
      template: '{x}',
      output: () => '',
    })

    expect(processCode('`{{remove me}}`', rules).text).toBe('')

    log.mockRestore()
  })

  it('compiles an empty code block instead of leaving markers in output', () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})
    const rules = makeRules({
      template: '{x}',
      output: () => '',
    })

    expect(processCode('`{{}}`', rules).text).toBe('')

    log.mockRestore()
  })

  it('wraps an empty code block in an unmatched comment when no rule matches', () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})
    const rules = makeRules({
      template: 'needs {x}',
      output: (vars) => (vars as VarsDict).x as string,
    })

    expect(processCode('`{{}}`', rules).text).toBe(
      '/* none of the rules matched */',
    )

    log.mockRestore()
  })

  it('keeps trailing text after an empty code block in the middle of input', () => {
    const rules = makeRules({
      template: '{x}',
      output: (vars) => `[${(vars as VarsDict).x}]`,
    })

    expect(processCode('before `{{}}` after', rules).text).toBe('before [] after')
  })

  it('requires trailing literal text in a rule template after the variable', () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})
    const rules = makeRules({
      template: '{x} end',
      output: (vars) => `ok:${(vars as VarsDict).x}`,
    })

    expect(processCode('`{{only}}`', rules).text).toBe(
      '/* none of the rules matched only*/',
    )

    log.mockRestore()
  })

  it('requires trailing literal text that follows a matched prefix and variable', () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})
    const rules = makeRules({
      template: 'foo {x} bar',
      output: (vars) => `ok:${(vars as VarsDict).x}`,
    })

    expect(processCode('`{{foo baz}}`', rules).text).toBe(
      '/* none of the rules matched foo baz*/',
    )

    log.mockRestore()
  })

  it('closes early on a wild closing marker and keeps the remainder as surrounding text', () => {
    const rules = makeRules({
      template: '{x}',
      output: (vars) => `(${(vars as VarsDict).x})`,
    })

    expect(processCode('`{{a + "}}`"}}`', rules).text).toBe('(a + ")"}}`')
  })

  it('extracts repeating array variables for html attribute lists', () => {
    const rules = makeRules({
      template: htmlAttrsTemplate,
      output: (vars) => formatHtmlAttrs(vars as VarsDict),
    })

    expect(processCode('`{{<input id="a" class="b" />}}`', rules).text).toBe(
      'input id a class b',
    )
  })

  it('extracts a single array repetition when only one match exists', () => {
    const rules = makeRules({
      template: htmlAttrsTemplate,
      output: (vars) => formatHtmlAttrs(vars as VarsDict),
    })

    expect(processCode('`{{<div title="hello" />}}`', rules).text).toBe(
      'div title hello',
    )
  })
})
