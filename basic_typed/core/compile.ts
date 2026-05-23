import type { ExtendSettingsFile } from "../utils/global"
import { parseTemplate, parseCode } from "./parse"
import settings, { unmatchedTextFunction } from "../utils/settings"
import type { UserRule } from "../utils/types"
import { range, startsWithAt } from "../utils/utils"
import { getVariables } from "./variables"
// todo handle bad rules

var unmatchedText: typeof unmatchedTextFunction = () => ''
if (settings.showNotMatched) unmatchedText = settings.unmatchedTextFunction

const compileBlock = (sourceCode: string, userRules: UserRule[]): string | undefined => {
  try {
    let tokenized = parseCode(sourceCode);
    for (const ruleIndex in userRules) {
      let rule = userRules[ruleIndex]
      let variables = getVariables(rule, tokenized, 0);
      if (!variables) continue;
      let result = rule.output(variables);
      if (result !== false) {
        if (settings.showMatchedRules) console.log(`block ( ${sourceCode.slice(0, 10)} ): matched ${rule.template}`);
        return result;
      }
    }
  } catch (e) {
    console.log(e, "An error has occured, please double check your rules.");
  }
};

const processCode = (
  sourceCode: string,
  userRules: UserRule[],
  fileName = '',
  insideBlock = false,
): { text: string; consumed: number } => {
  const codeMarkers = [settings.codeOpening, settings.codeClosing]
  var ingoreI: number[] = [];
  var isOpen = false;
  var accumulator = "";
  let outputText = "";

  for (let i = 0; i < sourceCode.length; i++) {
    let letter = sourceCode[i];
    if (ingoreI.includes(i)) continue;

    let foundOpenCode = startsWithAt(sourceCode, codeMarkers[0], i);
    let foundCloseCode = startsWithAt(sourceCode, codeMarkers[1], i);
    if (foundOpenCode) {
      const inner = processCode(
        sourceCode.slice(i + codeMarkers[0].length),
        userRules,
        fileName,
        true,
      );
      const res = inner.text;
      const compiled = compileBlock(res, userRules);
      outputText += compiled !== undefined ? compiled : unmatchedText(res, fileName);
      ingoreI.push(...range(i, i + codeMarkers[0].length + inner.consumed));
    }
    else if (insideBlock && foundCloseCode) {
      ingoreI.push(...range(i, i + codeMarkers[1].length));
      if (accumulator) { outputText += compileBlock(accumulator, userRules); }
      return { text: outputText, consumed: i + codeMarkers[1].length };
    }

    else if (isOpen) accumulator += letter;
    else if (!isOpen) { outputText += letter || letter; }
  }

  if (accumulator)
    outputText += compileBlock(accumulator, userRules);

  return { text: outputText, consumed: sourceCode.length };
};


let handleRules = (tesingFull: ExtendSettingsFile) => {
  let userRules = tesingFull.rules
  if (!userRules || !Array.isArray(userRules) || !userRules.length) {
    console.log('An error has occured, cant get rules', userRules, tesingFull)
    process.exit()
  }
  for (const rule of userRules)
    rule.parsed = parseTemplate(rule.template);

  return userRules;
};

exports.handleRules = handleRules;

export { processCode, handleRules };
export type { UserRule } from "../utils/types";
