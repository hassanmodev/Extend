"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unmatchedTextFunction = exports.formatUnmatchedBlockComment = exports.NONE_OF_THE_RULES_MATCHED = void 0;
exports.NONE_OF_THE_RULES_MATCHED = 'none of the rules matched';
const formatUnmatchedBlockComment = (block) => `/* ${block} | ${exports.NONE_OF_THE_RULES_MATCHED}*/`;
exports.formatUnmatchedBlockComment = formatUnmatchedBlockComment;
const unmatchedTextFunction = (block, file = '') => {
    if (file)
        file += '|';
    console.log(`${file} ${exports.NONE_OF_THE_RULES_MATCHED}:${block.slice(0, 8)}`);
    return (0, exports.formatUnmatchedBlockComment)(block);
};
exports.unmatchedTextFunction = unmatchedTextFunction;
const settings = {
    settings: false,
    showNotMatched: true,
    unmatchedTextFunction: exports.unmatchedTextFunction,
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
};
exports.default = settings;
