const fs = require("fs");
const decomment = require("decomment");

let colors = {
  word: { color: "#C586C0" },
  var: { color: "#9CDCFE" },
  arrayVar: { color: "#bbb" },
  terminals: { color: "#ccc4" },
  symbol: { color: "#ddd" },
  default: { color: "#ddd" },
};
var lastSettings = "";


var readSettings = () => {
  var settings;
  try {
    try {
      var file = fs.readFileSync("./.vscode/settings.json", "utf8");
      var text = decomment(file).trim() || "{}";
    } catch (ENOENT) {
      text = "{}";
    }
    settings = JSON.parse(text);
  } catch (e) {
    console.log("invalid settings.json.");
    return false;
  }
  return settings;
};

var writeSettings = (settings) => {  
  text = JSON.stringify(settings, "", 1);
  if (text === lastSettings) return false
  lastSettings = text;
  try {
    fs.mkdirSync("./.vscode");
  } catch (EEXIST) {}
  fs.writeFileSync("./.vscode/settings.json", text);
};

var escapeRegex = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

let anyButWordBAD = (word) => `([\\s\\S]+?(?=${word}))`;
let anyButWord = (word) => `((?:(?!${word})[\\s\\S])*)`;
var createRegex = (words, terminals = ["`{{", "}}`"]) => {
  let text = "";
  terminals = [escapeRegex(terminals[0]), escapeRegex(terminals[1])];

  let groups = [];
  let r = "";
  let group = (string) => r + "(" + string + ")" + r;

  text += group(terminals[0]);
  //569CD6',

  groups.push(colors["terminals"]);

  nextStaticString = (words) => {
    words.push({ type: "word", value: group(escapeRegex(terminals[1])) });
    return words.reduce((prev, curr) => {
      if (curr.type !== "word") return prev;
      return `${prev ? prev + "|" : ""}${curr.value}`;
    }, "");
  };

  var nextWord = (words, i) => words.slice(i).find(w => w.type ==='word' || w.type==='symbol')  
  
  words.forEach((word, i) => {
    if (word.type === "word" || word.type === "symbol") {
      text += group("[\\s]*" + escapeRegex(word.value) + "[\\s]*");
      groups.push( colors[word.type] || colors["default"] );
    } else {
      let next = nextWord(words, i)
      if(!next || !next.value) return ''
      let escaped = escapeRegex(next.value)
      let ored = escaped ? escaped+'|'+terminals[1] : escaped

      // console.log(anyButWord(ored), escaped)

      text += `${(anyButWord(ored)||anyButWord(terminals[1]))}`;
      groups.push( colors[word.type] || colors["default"] );
    }
  });

  text += group(terminals[1]);
  groups.push( colors["terminals"] );

  return { [text]: groups };
};

let clearSettings = (settings) => {
  for(let key in settings)
    if (key.slice(0, 10)==='highlight.')
      delete settings[key]

  writeSettings(settings)
}

var start = (userRules, terminals) => {
  var settings = readSettings();
  if (!settings) return false;
  if (!global.settings.vscodeHighlighting) return clearSettings(settings)
  let rules = userRules;
  settings["highlight.regexes"] = {};

  rules.forEach((rule) => {
    let block = createRegex(rule.parsed, terminals);
    settings["highlight.regexes"] = {
      ...settings["highlight.regexes"],
      ...block,
    };
  });


  // default case
  settings["highlight.regexes"][
    `(${terminals[0]})${anyButWord(terminals[1])}(${terminals[1]})`
  ] = [ colors.terminals, colors.default, colors.terminals ];

  writeSettings(settings)
};

exports.start = start;