import settings from "./settings"

export type Token = {
  value?: string,
  str?: string,
  type?: string,
  rest?: any,
}
const _parseTemplate = (text: string, findVars: boolean): Token[] => {
  var symbolsArray = "'\"\\/,`!@#$%^&*+-;:?><=[]{}().".split("");
  let terminals = [settings.variableOpening, settings.variableClosing];
  let arrTerminals = [settings.arrayOpening, settings.arrayClosing];
  let escapeChar = settings.escapeCharacter;

  let array: Token[] = [{ value: "" }];
  let skipIndex: Number[] = [];

  let inVar = false;
  let inArr = false;

  for (let i = 0; i < text.length; i++) {
    // console.log(i)
    const letter = text[i];
    let last = array.length ? array[array.length - 1] : array[0];

    if (skipIndex.includes(i)) {
      last.value = (last.value || "") + letter;
      last.str = (last.str || "") + letter;
      if (symbolsArray.includes(letter)) {
        last.type = 'symbol'
      }
      continue;
    } else if (letter === escapeChar) {
      skipIndex.push(i + 1);
      continue;
    }

    // findvars is for parsing templates..
    if (findVars) {
      if (arrTerminals[0] === letter) {
        inArr = true;
        inVar = true;
        array.push({ value: "", type: "arrayVar" });
        continue;
      } else if (arrTerminals[1] === letter) {
        inArr = false;
        inVar = true;
        array.push({ type: "word", value: "" });
        continue;
      }
      if (!inArr) {
        if (terminals[0] === letter) {
          inVar = true;
          array.push({ value: "", type: "var" });
          continue;
        } else if (terminals[1] === letter) {
          inVar = false;
          array.push({ type: "word", value: "" });
          continue;
        }
      }

      if (inVar) {
        // if (letter.match(/\s/)) carriedSpace = letter
        // else last.value += letter
        last.value += letter;
        // find first word with some value as some might just be blank..
        let tmp = array.length - 1;
        while (tmp >= 0) {
          if (array[tmp].value) {
            array[tmp].str = (array[tmp].str || "") + letter;
            break;
          }
          tmp--;
        }
        continue;
      }
    }

    if (symbolsArray.includes(letter)) {
      array.push({
        value: letter,
        type: "symbol",
        str: letter,
      });
      array.push({});
      continue;
    } else {
      if (letter.match(/\s/)) {
        let tmp = array.length - 1;
        while (tmp >= 0) {
          if (array[tmp].value) {
            array[tmp].str = (array[tmp].str || "") + letter;
            break;
          }
          tmp--;
        }
        array.push({});
      } else if (letter === "\n") {
        last.str = (last.str || "") + letter;
      } else {
        last.value = (last.value || "") + letter;

        let tmp = array.length - 1;
        while (tmp >= 0) {
          if (array[tmp].value) {
            array[tmp].str = (array[tmp].str || "") + letter;
            break;
          }
          tmp--;
        }
        last.type = "word";
      }
    }
  }

  array = array.filter((w) => Object.keys(w).length && w && w.value !== "");

  const ll = (...a) => {
    // if (!findVars)
    //   console.log(...a)
  }
  array.forEach((word, i) => {
    ll(word)
    if (word.type === "arrayVar") {
      ll('ind222')
      let obj = {
        type: "arrayVar",
        name: array[i - 1].value,
        array: parseTemplate(word.str),
      };
      array[i] = obj;
      array.splice(i - 1, 1);
    } else if (word.type === "var") {
      ll('xxxx')
      if (!word.value) return;
      word.value = word.value.trim();
      let wordArray = word.value.split(/\s/);
      if (!findVars)
        console.log(word, wordArray, findVars)
      if (wordArray.length > 1) {
        word.rest = wordArray.slice(0, -1);
        word.value = wordArray[wordArray.length - 1];
      }
    }
  });

  // console.log(array)
  // array.forEach((word) => {
  //     if(word.value){
  //         console.log('s', word, word.value.trim())
  //         return word.value.trim()
  //     }
  // })
  return array;
};

let defaultPairs = [
  { array: ['"', '"'], ignore: 1 },
  { array: ["'", "'"], ignore: 1 },
  { array: ["`", "`"], ignore: 1 },
  { array: ["}", "`"], ignore: 1 },
  { array: ["`", "`"], ignore: 1 },
  { array: ["[", "]"] },
  { array: ["{", "}"] },
  { array: ["(", ")"] },
  { array: ["//", "\n"], ignore: 1 },
  { array: ["/*", "*/"], ignore: 1 },
];

let checkPair = (pairObj, word) => pairObj.array[1] === word;
let unbalanced = (str, pairs) => {
  pairs = pairs || defaultPairs;
  if (!(pairs && pairs.length) || !str) return 0;
  let symbolStack: any[] = [];
  let tildeTemp = { array: ["${", "}"] };
  for (let i = 0; i < str.length; i++) {
    for (let j = 0; j < pairs.length; j++) {
      let pairObj = pairs[j];
      let pair = pairObj.array;
      let l = pair[0].length;

      let ahead = str.slice(i, i + l);
      if (i + l > str.length) {
        continue;
      }
      let lastSymbol = symbolStack[symbolStack.length - 1] || { array: [] };

      if (checkPair(lastSymbol, ahead)) symbolStack.pop();
      else if (lastSymbol.ignore && str.slice(i - 1, i + 1) === "${")
        symbolStack.push(tildeTemp);
      else if (pair[0] === ahead && !lastSymbol.ignore) {
        symbolStack.push(pairObj);
      } else continue;
      break;
    }
  }
  return symbolStack.length;
};
// const parseTemplate = (str) => _parseTemplate(str, true);
const parseCode = (str) => _parseTemplate(str, false)
const parseTemplate = (str) => _parseTemplate(str, true)
export {
  parseCode,
  parseTemplate,
  unbalanced
}