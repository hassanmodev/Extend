import "../utils/global"
import { Token, unbalanced } from "./parse"
import settings from "../utils/settings"
import type { TemplateToken, UserRule, VarsDict } from "../utils/types"

const isRightKeyword = (found: Token, rule: UserRule, i: number) => {
  let template = rule.parsed;
  let word = template[i];
  if (!word) return false
  return found && word && found.value === word.value;
};

const addVariable = (
  foundWord: Token,
  templateWord: Token,
  foundVariables: VarsDict
) => {
  if (!templateWord.value) return
  foundVariables[templateWord.value] = foundVariables[templateWord.value] || "";
  foundVariables[templateWord.value] += foundWord.str || foundWord.value || ""
}

const literalsSatisfied = (rule: UserRule, tokenized: Token[]) => {
  let searchFrom = 0
  for (const token of rule.parsed) {
    if (token.type === 'var' || token.type === 'arrayVar') continue
    const lit = token.value
    if (!lit) return false
    let found = false
    for (let i = searchFrom; i < tokenized.length; i++) {
      if (tokenized[i].value === lit) {
        found = true
        searchFrom = i + 1
        break
      }
    }
    if (!found) return false
  }
  return true
}

const variableMatchRule = (variables: TemplateToken[], foundVariables: VarsDict) => {
  for (var variable of variables) {
    const key = variable.value || variable.name
    if (!key) return false
    var extractedValue = foundVariables[key];
    if (extractedValue === undefined || (Array.isArray(extractedValue) && !extractedValue.length)) {
      settings.showNotFound && console.log(key, 'not found in', foundVariables)
      return false;
    }
    if (typeof extractedValue !== 'string') continue
    if (extractedValue === "" && !variable.rest) continue
    if (!extractedValue) {
      settings.showNotFound && console.log(key, 'not found in', foundVariables)
      return false;
    }
    if (!variable.rest) continue
    let type = variable.rest[0]
    if (type) {
      extractedValue = extractedValue.trim()
      let filter = global.settingsFile.types[type]
      if (!filter) {
        console.log(`type "${variable.rest[0]}" didn't match any type`)
        return false
      }
      if (filter instanceof RegExp) {
        if (!extractedValue.match(filter)) {
          console.log(extractedValue, 'didn\'t match regex', filter)
          return false
        }
      } else if (filter instanceof Function) {
        let returned = filter(extractedValue)
        if (returned === false) {
          console.log(extractedValue, 'didn\'t match type', type)
          return false
        }
        foundVariables[key] = String(returned)
      }
    }
  }
  return true
};

const arrayVarsSatisfied = (rule: UserRule, foundVariables: VarsDict) => {
  for (const token of rule.parsed) {
    if (token.type !== 'arrayVar' || !token.name) continue
    const extracted = foundVariables[token.name]
    if (!Array.isArray(extracted) || !extracted.length) return false
    const innerVars = token.array?.filter((t) => t.type === 'var') ?? []
    for (const item of extracted) {
      if (!variableMatchRule(innerVars, item)) return false
    }
  }
  return true
}

export const getVariables = (rule: UserRule, toknized: Token[], wordAfterArray: Token | 0 = 0): VarsDict | VarsDict[] | false => {
  var template = rule.parsed;
  let vars: VarsDict = {};
  var varsDictArray: VarsDict[] = wordAfterArray ? [{}] : [];
  var insertArrayBlock = false;
  var inVar = false;
  var template_index_adjust = 0;
  var skipI = false;
  var templateIndex = 0;
  var templateRealIndex = 0;
  var breakWhile = false;
  var breakFor = 0;


  while (true) {
    if (templateIndex === template.length) {
      if (wordAfterArray) {
        templateIndex = 0
        insertArrayBlock = true
      } else {
        break
      }
    }

    if (templateRealIndex > 100000) {
      break
    }
    var templateWord = template[templateIndex];
    if (!templateWord) {
      console.log('no temp word', templateIndex, template)
      break
    }

    if (templateWord.type === 'arrayVar') {
      const startIdx = templateRealIndex + template_index_adjust
      const endToken = template[templateIndex + 1]
      const arrayResult = getVariables(
        { ...rule, parsed: templateWord.array! },
        toknized.slice(startIdx),
        endToken || 0,
      )

      if (arrayResult === false || !Array.isArray(arrayResult) || !arrayResult.length) {
        return false
      }

      vars[templateWord.name!] = arrayResult

      if (endToken) {
        for (let j = startIdx; j < toknized.length; j++) {
          if (toknized[j].value === endToken.value) {
            template_index_adjust = j - templateRealIndex
            break
          }
        }
      } else {
        template_index_adjust = toknized.length - templateRealIndex - 1
      }

      templateIndex++
      templateRealIndex++
      continue
    }

    inVar = templateWord.type === "var";
    if (skipI) {
      skipI = false;
      template_index_adjust--;
      continue;
    }

    if (toknized.length === 0) break
    for (var foundIndex = templateRealIndex + template_index_adjust; foundIndex < toknized.length; foundIndex++) {
      var foundWord = toknized[foundIndex];
      let nextTempWord = template[templateIndex + 1]
      let nextFound = toknized[foundIndex + 1]


      if (inVar && nextTempWord?.type === 'arrayVar') {
        addVariable(foundWord, templateWord, vars)
        break
      }

      if (nextTempWord?.type === 'arrayVar') {
        const firstInner = nextTempWord.array?.find((t) => t.value)
        if (firstInner && nextFound && nextFound.value === firstInner.value) {
          breakFor = 1
        }
      }

      if (wordAfterArray)
        if (nextTempWord && wordAfterArray.value === foundWord.value) breakWhile = true


      if (templateWord.type !== "var" && isRightKeyword(foundWord, rule, templateIndex)) {
        if (!breakFor && !breakWhile) {
          break
        }
      }

      if (isRightKeyword(foundWord, rule, templateIndex + 1)) {
        const raw = templateWord.value ? vars[templateWord.value] : undefined
        const lastFoundVarsDict = typeof raw === 'string' ? raw : undefined
        if (!unbalanced(lastFoundVarsDict || '')) {
          if (!breakFor && !breakWhile) {
            skipI = true;
            break
          }
        }
      }
      template_index_adjust++;
      if (wordAfterArray) {
        if (insertArrayBlock) { varsDictArray.push({}); insertArrayBlock = false }
        if (templateWord.type === 'var') {
          addVariable(foundWord, templateWord, varsDictArray[varsDictArray.length - 1])
        }
      }
      if (inVar) addVariable(foundWord, templateWord, vars)
      if (breakFor) { breakFor = 0; break; }
    }

    templateIndex++; templateRealIndex++;
    if (breakWhile) { breakWhile = false; break; }
  }

  var tempVars = rule.parsed.filter((k): k is TemplateToken & { type: 'var' } =>
    k.type === "var"
  );

  if (
    !wordAfterArray &&
    toknized.length === 0 &&
    rule.parsed.every((t) => t.type === 'var')
  ) {
    for (const variable of tempVars) {
      const key = variable.value || variable.name
      if (key) vars[key] = ""
    }
  }

  if (wordAfterArray) {
    for (let arrayIndex = 0; arrayIndex < varsDictArray.length; arrayIndex++) {
      vars = varsDictArray[arrayIndex]
      if (!variableMatchRule(tempVars, vars)) varsDictArray.splice(+arrayIndex, 1)
    }
  } else {
    if (!literalsSatisfied(rule, toknized)) return false;
    if (!variableMatchRule(tempVars, vars)) return false;
    if (!arrayVarsSatisfied(rule, vars)) return false;
  }


  if (wordAfterArray) return varsDictArray
  return vars;
};
