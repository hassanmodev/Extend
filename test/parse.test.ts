import { describe, expect, it } from 'vitest'
import { parseCode, parseTemplate, unbalanced } from '../basic_typed/core/parse'

describe('unbalanced', () => {
  it('returns 0 for empty or missing input', () => {
    expect(unbalanced('')).toBe(0)
  })

  it('returns 0 when brackets are balanced', () => {
    expect(unbalanced('()')).toBe(0)
    expect(unbalanced('{a[b(c)]}')).toBe(0)
  })

  it('returns a positive count when brackets are left open', () => {
    expect(unbalanced('(')).toBeGreaterThan(0)
    expect(unbalanced('{[')).toBeGreaterThan(0)
  })
})

describe('parseTemplate', () => {
  it('extracts a single variable token', () => {
    expect(parseTemplate('{name}')).toEqual([
      { value: 'name', type: 'var', str: 'name' },
    ])
  })

  it('splits literal text and variables', () => {
    expect(parseTemplate('hello {world}')).toEqual([
      { value: 'hello', str: 'hello ', type: 'word' },
      { value: 'world', type: 'var', str: 'world' },
    ])
  })

  it('parses typed variables into rest + name', () => {
    expect(parseTemplate('{int count}')).toEqual([
      { value: 'count', type: 'var', str: 'int count', rest: ['int'] },
    ])
  })

  it('parses array variable syntax for repeating segments', () => {
    expect(parseTemplate('{attrs}[{name}="{val}"]')).toEqual([
      {
        type: 'arrayVar',
        name: 'attrs',
        array: [
          { value: 'name', type: 'var', str: 'name' },
          { value: '=', type: 'symbol', str: '=' },
          { value: '"', type: 'symbol', str: '"' },
          { value: 'val', type: 'var', str: 'val' },
          { value: '"', type: 'symbol', str: '"' },
        ],
      },
    ])
  })

  it('keeps literal text after an array segment', () => {
    expect(parseTemplate('{items}[{x}]]')).toEqual([
      {
        type: 'arrayVar',
        name: 'items',
        array: [{ value: 'x', type: 'var', str: 'x' }],
      },
      { value: ']', type: 'symbol', str: ']' },
    ])
  })

  it('keeps escaped brackets as literals instead of array syntax', () => {
    expect(parseTemplate('{array} #[{start}:{end}#]')).toEqual([
      { value: 'array', type: 'var', str: 'array ' },
      { value: '[', type: 'symbol', str: '[' },
      { value: 'start', type: 'var', str: 'start' },
      { value: ':', type: 'symbol', str: ':' },
      { value: 'end', type: 'var', str: 'end' },
      { value: ']', type: 'symbol', str: ']' },
    ])
  })

  it('treats ## as a literal hash in rule templates', () => {
    expect(parseTemplate('propagate##({expr})').map((t) => t.value)).toEqual([
      'propagate#',
      '(',
      'expr',
      ')',
    ])
  })

  it('merges an escaped open paren into the preceding word token', () => {
    expect(parseTemplate('propagate#({expr}#)').map((t) => t.value)).toEqual([
      'propagate(',
      'expr',
      ')',
    ])
  })
})

describe('parseCode', () => {
  it('tokenizes words and symbols without treating braces as variables', () => {
    expect(parseCode('foo(bar)')).toEqual([
      { value: 'foo', str: 'foo', type: 'word' },
      { value: '(', type: 'symbol', str: '(' },
      { value: 'bar', str: 'bar', type: 'word' },
      { value: ')', type: 'symbol', str: ')' },
    ])
  })

  it('treats an escaped opening brace as literal text', () => {
    expect(parseCode('#{literal}')).toEqual([
      { value: '{literal', str: '{literal', type: 'word' },
      { value: '}', type: 'symbol', str: '}' },
    ])
  })

  it('tokenizes pipe delimiters even when adjacent to identifiers', () => {
    expect(parseCode('for (tags) |tag|{')).toEqual([
      { value: 'for', str: 'for ', type: 'word' },
      { value: '(', type: 'symbol', str: '(' },
      { value: 'tags', str: 'tags', type: 'word' },
      { value: ')', type: 'symbol', str: ') ' },
      { value: '|', type: 'symbol', str: '|' },
      { value: 'tag', str: 'tag', type: 'word' },
      { value: '|', type: 'symbol', str: '|' },
      { value: '{', type: 'symbol', str: '{' },
    ])
  })

  it('tokenizes spaced pipe delimiters the same as tight pipes', () => {
    expect(parseCode('catch | e | recovered').map((t) => t.value)).toEqual(
      parseCode('catch |e| recovered').map((t) => t.value),
    )
  })

  it('splits any non-identifier punctuation as symbols without a manual list', () => {
    expect(parseCode('a~b%c&d').map((t) => t.value)).toEqual([
      'a',
      '~',
      'b',
      '%',
      'c',
      '&',
      'd',
    ])
  })
})
