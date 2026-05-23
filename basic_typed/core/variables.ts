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

const variableMatchRule = (variables: TemplateToken[], foundVariables: VarsDict) => {
  for (var variable of variables) {
    const key = variable.value || variable.name
    if (!key) return false
    var extractedValue = foundVariables[key];
    if (!extractedValue || (Array.isArray(extractedValue) && !extractedValue.length)) {
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

export const getVariables = (rule: UserRule, toknized: Token[], wordAfterArray: Token | 0 = 0): VarsDict | VarsDict[] | false => {
  var template = rule.parsed;
  let vars: VarsDict = {};
  var varsDictArray = new Array<VarsDict>();
  var insertArrayBlock = false;
  var inVar = false;
  var template_index_adjust = 0;
  var skipI = false;
  var templateIndex = 0;
  var templateRealIndex = 0;
  var breakWhile = false;
  var breakFor = 0;


  while (true) {
    if (!wordAfterArray) {
      if (templateIndex === template.length) {
        templateIndex = 0
        templateWord = template[templateIndex]
        insertArrayBlock = true
      }
    }
    else if (!(templateIndex < template.length)) break

    if (templateRealIndex > 100000) {
      break
    }
    var templateWord = template[templateIndex];
    if (!templateWord) {
      console.log('no temp word', templateIndex, template)
      break
    }

    if (templateWord.type === 'arrayVar') {
      console.log('array var is disabled')
      continue;
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


      if (nextTempWord)
        if (nextTempWord.type === 'arrayVar' && nextTempWord.array?.[0] && nextFound && (nextFound.value === nextTempWord.array[0].value)) {
          breakFor = 1
        }

      if (wordAfterArray)
        if (nextTempWord && wordAfterArray.value === foundWord.value) breakWhile = true


      if (templateWord.type !== "var" && isRightKeyword(foundWord, rule, templateIndex)) {
        if (!breakFor && !breakWhile) {
          break
        }
      }

      if (isRightKeyword(foundWord, rule, templateIndex + 1)) {
        let lastFoundVarsDict = templateWord.value ? vars[templateWord.value] : undefined
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
        addVariable(foundWord, templateWord, varsDictArray[varsDictArray.length - 1])
      }
      if (inVar) addVariable(foundWord, templateWord, vars)
      if (breakFor) { breakFor = 0; break; }
    }

    templateIndex++; templateRealIndex++;
    if (breakWhile) { breakWhile = false; break; }
  }

  var tempVars = rule.parsed.filter((k): k is TemplateToken & { type: 'var' | 'arrayVar' } =>
    k.type === "var" || k.type === 'arrayVar'
  );

  if (wordAfterArray) {
    for (let arrayIndex = 0; arrayIndex < varsDictArray.length; arrayIndex++) {
      vars = varsDictArray[arrayIndex]
      if (!variableMatchRule(tempVars, vars)) varsDictArray.splice(+arrayIndex, 1)
    }
  } else {
    if (!variableMatchRule(tempVars, vars)) return false;
  }


  if (wordAfterArray) return varsDictArray
  return vars;
};
