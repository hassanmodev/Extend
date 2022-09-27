export const unmatchedTextFunction = (block, file = '') => {
  if (file) file += '|'
  console.log(`${file} none of the rules matched:${block.slice(0, 8)}`)
  return `/* none of the rules matched ${block}*/`
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