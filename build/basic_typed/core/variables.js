"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVariables = void 0;
require("../utils/global");
const parse_1 = require("./parse");
const settings_1 = __importDefault(require("../utils/settings"));
const isRightKeyword = (found, rule, i) => {
    let template = rule.parsed;
    let word = template[i];
    if (!word)
        return false;
    return found && word && found.value === word.value;
};
const addVariable = (foundWord, templateWord, foundVariables) => {
    if (!templateWord.value)
        return;
    foundVariables[templateWord.value] = foundVariables[templateWord.value] || "";
    foundVariables[templateWord.value] += foundWord.str || foundWord.value || "";
};
const literalsSatisfied = (rule, tokenized) => {
    let searchFrom = 0;
    for (const token of rule.parsed) {
        if (token.type === 'var' || token.type === 'arrayVar')
            continue;
        const lit = token.value;
        if (!lit)
            return false;
        let found = false;
        for (let i = searchFrom; i < tokenized.length; i++) {
            if (tokenized[i].value === lit) {
                found = true;
                searchFrom = i + 1;
                break;
            }
        }
        if (!found)
            return false;
    }
    return true;
};
const variableMatchRule = (variables, foundVariables) => {
    for (var variable of variables) {
        const key = variable.value || variable.name;
        if (!key)
            return false;
        var extractedValue = foundVariables[key];
        if (extractedValue === undefined || (Array.isArray(extractedValue) && !extractedValue.length)) {
            settings_1.default.showNotFound && console.log(key, 'not found in', foundVariables);
            return false;
        }
        if (typeof extractedValue !== 'string')
            continue;
        if (extractedValue === "" && !variable.rest)
            continue;
        if (!extractedValue) {
            settings_1.default.showNotFound && console.log(key, 'not found in', foundVariables);
            return false;
        }
        if (!variable.rest)
            continue;
        let type = variable.rest[0];
        if (type) {
            extractedValue = extractedValue.trim();
            let filter = global.settingsFile.types[type];
            if (!filter) {
                console.log(`type "${variable.rest[0]}" didn't match any type`);
                return false;
            }
            if (filter instanceof RegExp) {
                if (!extractedValue.match(filter)) {
                    console.log(extractedValue, 'didn\'t match regex', filter);
                    return false;
                }
            }
            else if (filter instanceof Function) {
                let returned = filter(extractedValue);
                if (returned === false) {
                    console.log(extractedValue, 'didn\'t match type', type);
                    return false;
                }
                foundVariables[key] = String(returned);
            }
        }
    }
    return true;
};
const arrayVarsSatisfied = (rule, foundVariables) => {
    var _a, _b;
    for (const token of rule.parsed) {
        if (token.type !== 'arrayVar' || !token.name)
            continue;
        const extracted = foundVariables[token.name];
        if (!Array.isArray(extracted) || !extracted.length)
            return false;
        const innerVars = (_b = (_a = token.array) === null || _a === void 0 ? void 0 : _a.filter((t) => t.type === 'var')) !== null && _b !== void 0 ? _b : [];
        for (const item of extracted) {
            if (!variableMatchRule(innerVars, item))
                return false;
        }
    }
    return true;
};
const tokensToStr = (tokens, from, to) => {
    var _a, _b;
    let s = '';
    for (let i = from; i < to; i++) {
        s += (_b = (_a = tokens[i].str) !== null && _a !== void 0 ? _a : tokens[i].value) !== null && _b !== void 0 ? _b : '';
    }
    return s;
};
const collectEndSuffix = (template, fromIndex) => {
    const suffix = [];
    for (let k = fromIndex; k < template.length; k++) {
        const t = template[k];
        if (t.type === 'var' || t.type === 'arrayVar')
            break;
        suffix.push(t);
    }
    return suffix;
};
const suffixMatches = (tokens, index, suffix) => {
    var _a;
    if (!suffix.length)
        return false;
    for (let i = 0; i < suffix.length; i++) {
        if (((_a = tokens[index + i]) === null || _a === void 0 ? void 0 : _a.value) !== suffix[i].value)
            return false;
    }
    return true;
};
const isArrayEndAt = (tokens, index, endSuffix, prefixFrom = 0) => {
    if (!suffixMatches(tokens, index, endSuffix))
        return false;
    return (0, parse_1.unbalanced)(tokensToStr(tokens, prefixFrom, index)) === 0;
};
const getVariables = (rule, toknized, endAfterArray = []) => {
    var _a;
    var template = rule.parsed;
    let vars = {};
    var varsDictArray = endAfterArray.length ? [{}] : [];
    var insertArrayBlock = false;
    var inVar = false;
    var template_index_adjust = 0;
    var skipI = false;
    var templateIndex = 0;
    var templateRealIndex = 0;
    var breakWhile = false;
    var breakFor = 0;
    let consumedThrough = -1;
    while (true) {
        if (templateIndex === template.length) {
            if (endAfterArray.length) {
                templateIndex = 0;
                insertArrayBlock = true;
            }
            else {
                break;
            }
        }
        if (templateRealIndex > 100000) {
            break;
        }
        var templateWord = template[templateIndex];
        if (!templateWord) {
            console.log('no temp word', templateIndex, template);
            break;
        }
        if (templateWord.type === 'arrayVar') {
            const startIdx = templateRealIndex + template_index_adjust;
            const endSuffix = collectEndSuffix(template, templateIndex + 1);
            const arrayResult = (0, exports.getVariables)(Object.assign(Object.assign({}, rule), { parsed: templateWord.array }), toknized.slice(startIdx), endSuffix);
            if (arrayResult === false || !Array.isArray(arrayResult) || !arrayResult.length) {
                return false;
            }
            vars[templateWord.name] = arrayResult;
            if (endSuffix.length) {
                for (let j = startIdx; j < toknized.length; j++) {
                    if (isArrayEndAt(toknized, j, endSuffix, startIdx)) {
                        template_index_adjust = j - templateRealIndex;
                        consumedThrough = j + endSuffix.length - 1;
                        break;
                    }
                }
            }
            else {
                template_index_adjust = toknized.length - templateRealIndex - 1;
                consumedThrough = toknized.length - 1;
            }
            templateIndex++;
            templateRealIndex++;
            continue;
        }
        inVar = templateWord.type === "var";
        if (skipI) {
            skipI = false;
            template_index_adjust--;
            continue;
        }
        if (toknized.length === 0)
            break;
        for (var foundIndex = templateRealIndex + template_index_adjust; foundIndex < toknized.length; foundIndex++) {
            var foundWord = toknized[foundIndex];
            let nextTempWord = template[templateIndex + 1];
            let nextFound = toknized[foundIndex + 1];
            if (inVar && (nextTempWord === null || nextTempWord === void 0 ? void 0 : nextTempWord.type) === 'arrayVar') {
                addVariable(foundWord, templateWord, vars);
                break;
            }
            if ((nextTempWord === null || nextTempWord === void 0 ? void 0 : nextTempWord.type) === 'arrayVar') {
                const firstInner = (_a = nextTempWord.array) === null || _a === void 0 ? void 0 : _a.find((t) => t.value);
                if (firstInner && nextFound && nextFound.value === firstInner.value) {
                    breakFor = 1;
                }
            }
            if (endAfterArray.length &&
                isArrayEndAt(toknized, foundIndex, endAfterArray)) {
                breakWhile = true;
                break;
            }
            if (templateWord.type !== "var" && isRightKeyword(foundWord, rule, templateIndex)) {
                if (!breakFor && !breakWhile) {
                    consumedThrough = foundIndex;
                    break;
                }
            }
            if (isRightKeyword(foundWord, rule, templateIndex + 1)) {
                const raw = templateWord.value ? vars[templateWord.value] : undefined;
                const lastFoundVarsDict = typeof raw === 'string' ? raw : undefined;
                if (!(0, parse_1.unbalanced)(lastFoundVarsDict || '')) {
                    if (!breakFor && !breakWhile) {
                        skipI = true;
                        consumedThrough = foundIndex - 1;
                        break;
                    }
                }
            }
            if (templateWord.type !== "var")
                return false;
            template_index_adjust++;
            if (endAfterArray.length) {
                if (insertArrayBlock) {
                    varsDictArray.push({});
                    insertArrayBlock = false;
                }
                if (templateWord.type === 'var') {
                    addVariable(foundWord, templateWord, varsDictArray[varsDictArray.length - 1]);
                    consumedThrough = foundIndex;
                }
            }
            if (inVar) {
                addVariable(foundWord, templateWord, vars);
                consumedThrough = foundIndex;
            }
            if (breakFor) {
                breakFor = 0;
                break;
            }
        }
        templateIndex++;
        templateRealIndex++;
        if (breakWhile) {
            breakWhile = false;
            break;
        }
    }
    var tempVars = rule.parsed.filter((k) => k.type === "var");
    if (!endAfterArray.length &&
        toknized.length === 0 &&
        rule.parsed.every((t) => t.type === 'var')) {
        for (const variable of tempVars) {
            const key = variable.value || variable.name;
            if (key)
                vars[key] = "";
        }
    }
    if (endAfterArray.length) {
        for (let arrayIndex = 0; arrayIndex < varsDictArray.length; arrayIndex++) {
            vars = varsDictArray[arrayIndex];
            if (!variableMatchRule(tempVars, vars))
                varsDictArray.splice(+arrayIndex, 1);
        }
    }
    else {
        if (!literalsSatisfied(rule, toknized))
            return false;
        if (toknized.length > 0 &&
            consumedThrough !== toknized.length - 1) {
            return false;
        }
        if (!variableMatchRule(tempVars, vars))
            return false;
        if (!arrayVarsSatisfied(rule, vars))
            return false;
    }
    if (endAfterArray.length)
        return varsDictArray;
    return vars;
};
exports.getVariables = getVariables;
