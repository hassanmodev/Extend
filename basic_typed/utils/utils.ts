export const range = (start: number, end: number) =>
  Array.from({ length: end - start }, (_, i) => start + i)

export const startsWithAt = (str: string, needle: string, i: number) =>
  str.slice(i, i + needle.length) === needle
