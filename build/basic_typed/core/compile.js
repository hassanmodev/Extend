"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleRules = exports.processCode = void 0;
const parse_1 = require("./parse");
const settings_1 = __importDefault(require("../utils/settings"));
const utils_1 = require("../utils/utils");
const variables_1 = require("./variables");
// todo handle bad rules
var unmatchedText = () => '';
if (settings_1.default.showNotMatched)
    unmatchedText = settings_1.default.unmatchedTextFunction;
const compileBlock = (sourceCode, userRules) => {
    try {
        let tokenized = (0, parse_1.parseCode)(sourceCode);
        for (const ruleIndex in userRules) {
            let rule = userRules[ruleIndex];
            let variables = (0, variables_1.getVariables)(rule, tokenized);
            if (!variables)
                continue;
            let result = rule.output(variables);
            if (result !== false) {
                if (settings_1.default.showMatchedRules)
                    console.log(`block ( ${sourceCode.slice(0, 10)} ): matched ${rule.template}`);
                return result;
            }
        }
    }
    catch (e) {
        console.log(e, "An error has occured, please double check your rules.");
    }
};
const processCode = (sourceCode, userRules, fileName = '', insideBlock = false) => {
    const codeMarkers = [settings_1.default.codeOpening, settings_1.default.codeClosing];
    var ingoreI = [];
    var isOpen = false;
    var accumulator = "";
    let outputText = "";
    for (let i = 0; i < sourceCode.length; i++) {
        let letter = sourceCode[i];
        if (ingoreI.includes(i))
            continue;
        let foundOpenCode = (0, utils_1.startsWithAt)(sourceCode, codeMarkers[0], i);
        let foundCloseCode = (0, utils_1.startsWithAt)(sourceCode, codeMarkers[1], i);
        if (foundOpenCode) {
            const inner = processCode(sourceCode.slice(i + codeMarkers[0].length), userRules, fileName, true);
            const res = inner.text;
            const compiled = compileBlock(res, userRules);
            outputText += compiled !== undefined ? compiled : unmatchedText(res, fileName);
            ingoreI.push(...(0, utils_1.range)(i, i + codeMarkers[0].length + inner.consumed));
        }
        else if (insideBlock && foundCloseCode) {
            ingoreI.push(...(0, utils_1.range)(i, i + codeMarkers[1].length));
            if (accumulator) {
                outputText += compileBlock(accumulator, userRules);
            }
            return { text: outputText, consumed: i + codeMarkers[1].length };
        }
        else if (isOpen)
            accumulator += letter;
        else if (!isOpen) {
            outputText += letter || letter;
        }
    }
    if (accumulator)
        outputText += compileBlock(accumulator, userRules);
    return { text: outputText, consumed: sourceCode.length };
};
exports.processCode = processCode;
let handleRules = (tesingFull) => {
    let userRules = tesingFull.rules;
    if (!userRules || !Array.isArray(userRules) || !userRules.length) {
        console.log('An error has occured, cant get rules', userRules, tesingFull);
        process.exit();
    }
    for (const rule of userRules)
        rule.parsed = (0, parse_1.parseTemplate)(rule.template);
    return userRules;
};
exports.handleRules = handleRules;
exports.handleRules = handleRules;
