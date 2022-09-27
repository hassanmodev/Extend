import { parseTemplate, Token, unbalanced } from "./parse";
import settings, { unmatchedTextFunction } from "./settings"
import { parseCode } from "./parse";
// todo handle bad rules

var unmatchedText: typeof unmatchedTextFunction = () => ''
if (settings.showNotMatched) unmatchedText = settings.unmatchedTextFunction

const compileBlock = (sourceCode: string, userRules: any[]) => {
  try {
    let tokenized = parseCode(sourceCode);
    for (const ruleIndex in userRules) {
      let rule = userRules[ruleIndex]
      let variables = getVariables(rule, tokenized, 0, ruleIndex);
      if (!variables) continue;
      let result = rule.output(variables);
      if (result != false) {
        if (settings.showMatchedRules) console.log(`block ( ${sourceCode.slice(0, 10)} ): matched ${rule.template}`);
        return result;
      }
    }
  } catch (e) {
    console.log(e, "An error has occured, please double check your rules.");
  }
};

const range = (start: number, end: number) => {
  let array: Number[] = [];
  for (let i = start; i < end; i++) array.push(i);
  return array;
};
const processCode = (sourceCode, userRules, fileName = '') => {
  // IS_ARRAY_CALL && console.log(sourceCode)
  // extract and process code in place
  const find = (str, needle, i) => str.slice(i, i + needle.length) === needle;
  const codeMarkers = [settings.codeOpening, settings.codeClosing]
  var ingoreI: Number[] = [];
  var isOpen = false;
  var accumulator = "";
  let outputText = "";

  for (let i = 0; i < sourceCode.length; i++) {
    let letter = sourceCode[i];
    if (ingoreI.includes(i)) continue;

    let foundOpenCode = find(sourceCode, codeMarkers[0], i);
    let foundCloseCode = find(sourceCode, codeMarkers[1], i);
    // nested calls
    if (foundOpenCode) {
      var res = processCode(
        sourceCode.slice(i + codeMarkers[0].length),
        userRules,
      ).text;
      if (res) {
        outputText += compileBlock(res, userRules) || unmatchedText(res, fileName);
        ingoreI.push(...range(i, i + res.length + 2 * codeMarkers[1].length));
      }
    }
    // code finished.. return
    else if (foundCloseCode) {
      ingoreI.push(...range(i, i + codeMarkers[1].length));
      if (accumulator) { outputText += compileBlock(accumulator, userRules); }
      return { text: outputText };
    }

    else if (isOpen) accumulator += letter.value;
    else if (!isOpen) { outputText += letter.value || letter; }
  }

  if (accumulator)
    outputText += compileBlock(accumulator, userRules);

  return { text: outputText };
};


let handleRules = (tesingFull) => {
  let userRules = tesingFull.rules
  if (!userRules || !Array.isArray(userRules) || !userRules.length) {
    console.log('An error has occured, cant get rules', userRules, tesingFull)
    process.exit()
  }
  for (const rule of userRules) {
    rule.parsed = parseTemplate(rule.template);
    rule.enum = rule.parsed.map((word) => {
      if (word.type === "word") {
        if (!rule.config) return word;
        return rule.config.words
          ? rule.config.words.map((w) => w.enum)[0]
          : word;
      }
      return [];
    });
    // .filter(w => w)
  }
  return userRules;
};

var isRightKeyword = (found, rule, i) => {
  let template = rule.parsed;
  let word = template[i];
  if (!word) return false
  if (rule.config && rule.enum && rule.enum[i]) {
    return rule.enum[i].includes(found.value) || found.value === word.value;
  }
  return found && word && found.value === word.value;
};

const getVariables = (rule, toknized: Token[], wordAfterArray: any = 0, index = 'unknown') => {
  // rmv codemarkers
  // vars is the object returned containing all variables extracted
  // adj is a cursor to keep up with different indexes between template and found eg: variables consiting of more than one word
  var template = rule.parsed;
  var vars = {};
  var arrayVars = [{}];
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
      // console.log(`error: max iterations reached at code block ${index}. this may or may not be an issue ¯\\_(ツ)_/¯`)
      break
    }
    var templateWord = template[templateIndex];
    if (!templateWord) {
      console.log('no temp word', templateIndex, template)
      break
    }

    // #fix
    if (templateWord.type === 'arrayVar') {
      console.log('array var is disabled')
      // let sliceStart = foundIndex + 1
      // let processed = getVariables({ parsed: templateWord.array },
      //   found.slice(sliceStart),
      //   codeMarkers,
      //   template[tempIndex + 1]
      // )
      // vars[templateWord.name] = processed
      // tempIndex++
      // tempRealIndex++
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
        if (nextTempWord.type === 'arrayVar' && nextFound && (nextFound.value === nextTempWord.array[0].value)) {
          breakFor = 1
        }

      if (wordAfterArray)
        if (nextTempWord && wordAfterArray.value === foundWord.value) breakWhile = true


      // am i looking at the current word in template?
      if (templateWord.type !== "var" && isRightKeyword(foundWord, rule, templateIndex)) {
        if (!breakFor && !breakWhile) {
          // -------------------------->
          // if(parse.unbalanced())
          break
        }
      }

      // am i looking at the next word in template?
      // todo check if variable allows for unbalanced parentheses. 
      if (isRightKeyword(foundWord, rule, templateIndex + 1)) {
        let lastFoundVar = vars[templateWord.value]
        // is the current state of variable balanced?
        if (!unbalanced(lastFoundVar)) {
          if (!breakFor && !breakWhile) {
            skipI = true;
            break
          }
        }
      }
      template_index_adjust++;
      // #todo did i diable this?
      if (wordAfterArray) {
        if (insertArrayBlock) { arrayVars.push({}); insertArrayBlock = false }
        addVariable(foundWord, templateWord, arrayVars[arrayVars.length - 1])
      }
      if (inVar) addVariable(foundWord, templateWord, vars)
      if (breakFor) { breakFor = 0; break; }
    }

    templateIndex++; templateRealIndex++;
    if (breakWhile) { breakWhile = false; break; }
  }

  var tempVars = rule.parsed.filter((k) => ["var", 'arrayVar'].includes(k.type));

  // if is arraycall && any element is missing on any block remove block
  // else if any var is missing / or is array with 0 length then you are looking at the wrong rule.. return false
  if (wordAfterArray) {
    for (var arrayIndex in arrayVars) {
      var vars = arrayVars[arrayIndex]
      if (!variableMatchRule(tempVars, vars)) arrayVars.splice(+arrayIndex, 1)
    }
  } else {
    if (!variableMatchRule(tempVars, vars)) return false;
  }


  if (wordAfterArray) return arrayVars
  return vars;
};

var addVariable = (foundWord, templateWord, foundVariables) => {
  foundVariables[templateWord.value] = foundVariables[templateWord.value] || "";
  foundVariables[templateWord.value] += foundWord.str || foundWord.value
}
exports.handleRules = handleRules;

var variableMatchRule = (variables, foundVariables) => {
  for (var variable of variables) {
    var extractedValue = foundVariables[variable.value || variable.name];
    if (!extractedValue || (Array.isArray(extractedValue) && !extractedValue.length)) {
      settings.showNotFound && console.log(variable.value || variable.name, 'not found in', foundVariables)
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
        foundVariables[variable.value || variable.name] = returned
      }
    }
  }
  return true
};

export { processCode };