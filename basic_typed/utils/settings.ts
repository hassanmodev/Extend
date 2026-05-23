export const NONE_OF_THE_RULES_MATCHED = 'none of the rules matched'

export const formatUnmatchedBlockComment = (block: string) =>
  `/* ${block} | ${NONE_OF_THE_RULES_MATCHED}*/`

export const unmatchedTextFunction = (block: string, file: string = '') => {
  if (file) file += '|'
  console.log(`${file} ${NONE_OF_THE_RULES_MATCHED}:${block.slice(0, 8)}`)
  return formatUnmatchedBlockComment(block)
}

const settings = {
  settings: false,
  showNotMatched: true,
  unmatchedTextFunction,
  showMatchedRules: false,
  showNotFound: false,

  srcFolder: 't1',
  distFolder: 't2',
  codeOpening: '`{{',
  codeClosing: '}}`',
  variableOpening: '{',
  variableClosing: '}',
  arrayOpening: '[',
  arrayClosing: ']',
  escapeCharacter: '#',
  vscodeHighlighting: true
}
export default settings; 