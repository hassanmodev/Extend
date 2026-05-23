import { describe, expect, it, vi } from 'vitest'
import { range, startsWithAt } from './utils'
import { unmatchedTextFunction } from './settings'

describe('range', () => {
  it('returns consecutive numbers from start (inclusive) to end (exclusive)', () => {
    expect(range(2, 5)).toEqual([2, 3, 4])
  })

  it('returns an empty array when start equals end', () => {
    expect(range(5, 5)).toEqual([])
  })
})

describe('startsWithAt', () => {
  it('returns true when needle matches at the given index', () => {
    expect(startsWithAt('hello world', 'world', 6)).toBe(true)
    expect(startsWithAt('hello world', 'world', 0)).toBe(false)
  })

  it('returns true for an empty needle at any index', () => {
    expect(startsWithAt('abc', '', 2)).toBe(true)
  })
})

describe('unmatchedTextFunction', () => {
  it('wraps unmatched block text in a comment', () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})
    const block = 'some code'

    expect(unmatchedTextFunction(block)).toBe(
      '/* none of the rules matched some code*/',
    )
    expect(unmatchedTextFunction(block, 'file.ts')).toBe(
      '/* none of the rules matched some code*/',
    )

    log.mockRestore()
  })
})
