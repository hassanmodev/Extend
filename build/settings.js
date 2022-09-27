"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unmatchedTextFunction = void 0;
const unmatchedTextFunction = (block, file = '') => {
    if (file)
        file += '|';
    console.log(`${file} none of the rules matched:${block.slice(0, 8)}`);
    return `/* none of the rules matched ${block}*/`;
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
