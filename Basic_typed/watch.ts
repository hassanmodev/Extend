// next up better var detection
// handle deleted files

var commandLineArgs = require("command-line-args");
var fs = require("fs");
var fse = require("fs-extra");
var path = require("path");
var chokidar = require("chokidar");
var example = require("./example");
var highlight = require('./highlight')

let badDirectories = ['git', 'node_modules']
var watcher = chokidar.watch("file or dir", {
  ignored: /node\_modules|\.git/,
  persistent: true
});
var folders // = ["src", "dist"];
var extentions = [["xt"], ["xt", "js"]];
var defaultRulesFileName = "_extend.js";
var rulesFileName = "_extend.js";
// var currentDirectory = process.cwd()
// var srcDirectory = path.join(currentDirectory, folders[0]);
// var rulesfullName = path.join(currentDirectory, folders[0], rulesFileName);


global.msg = (...msgs) => {
  let time = new Date().toLocaleString().split(' ')[1]
  console.log(`${time}|`,...msgs)
}

var optionDefinitions = [
  { name: "help", alias: "h", type: Boolean },
  { name: "start", alias: "s", type: Boolean },
  { name: "other", defaultOption: true, type: String }
];

var defaultSettings = {
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
}
var settings = defaultSettings
global.settings = settings

var userSettings = defaultSettings
var compileModule = require("./compile");
try {
  var cliOptions = commandLineArgs(optionDefinitions);
} catch (error) {
  console.log("Unknown argument", error.optionName);
  console.log("Use -h for instructions.");
  process.exit();
}

if (cliOptions.help) {
  console.log(
    `use --start or -s to create a basic example, \nPlease refer to https://github.com/se7smohamed/Extend for further help.`
  );
  process.exit();
} else if (cliOptions.start) {
  console.log("Creating a Hello World example.");
  example.text.forEach(file => {
    fse.outputFileSync(file.file, file.text);
  });
}

getSettingsFile = fileName => {
  try {
    Object.keys(require.cache).forEach(function (key) { delete require.cache[key] })
    userRules = require(path.join(fileName));
    global.settingsFile = {...global.settingsFile, ...userRules}
    global.settings = {...global.settings, ...userRules.settings || {}}
    return userRules;
  } catch (MODULE_NOT_FOUND) {
    console.log("rules file not found, make sure you have a valid _extend.js file at the current directory.");
    process.exit()
  }
}
var getUserRules = (fileName) => {
  var settingsFile = getSettingsFile(fileName)
  // todo reload module: again.. no idea, sometimes it would fail when opening file, need to change how i reload modules.
  let maxAttempets = 15
  for (let i = 0; i < maxAttempets; i++) {
    if(!Object.keys(settingsFile).length) {settingsFile = getSettingsFile(fileName)}
    else break
  }
  var userRules = settingsFile.rules;
  userRules = compileModule.handleRules(settingsFile);
  let markers = [settingsFile.settings.codeOpening, settingsFile.settings.codeClosing]
  highlight.start(userRules, markers)
  return userRules;
};

var writeToFile = (processed, fileName) => {
  if(!processed) return global.msg(`${fileName}: got nothing to write.`)
  fse.outputFileSync(fileName, processed);
  global.msg('Success.')
};

var getFileName = fileName => {
  var rmvPath = path.join(process.cwd(), folders[0]);
  return fileName.replace(rmvPath, "");
}
var getPathAfterSrc = fileName => {
  var relativePath = getFileName(fileName)
  var outPath = path.join(folders[1], relativePath);
  return outPath;
};
var lastSaved = {}
var localCompile = async fileName => {
  // this time difference thing is because of an issue with vscode when saving
  let minTime = 200
  let last = lastSaved[fileName]||0
  let time = Date.now()
  if(last && time-last < minTime ){ return }
  lastSaved[fileName] = Date.now()

  let badFileReg = new RegExp(`${badDirectories.join('|')}`)
  if (fileName.match(badFileReg)) {
    return console.log('xxxxxx bad dir')
  }

  // again, vscode
  await ( new Promise(res => setTimeout(res, minTime) ) )
  var shoudCompile = name => {
    var nameList = name.split(".");
    if (path.basename(name) === rulesFileName) { return 'rules'; }
    if (nameList.slice(-1).join() === extentions[0].join()) return "xt";
    if (nameList.slice(-2).join() === extentions[1].join()) return "xt.js";
    return false;
  };

  
  var writeName = getPathAfterSrc(fileName);
  var shouldCompile = shoudCompile(fileName);
  if (shouldCompile === 'rules') {
    userRules = getUserRules(rulesfullName);
    global.msg('Updated rules.')
    return 1;
  }
  if (!shouldCompile){
    return writeToFile(fs.readFileSync(fileName).toString(), writeName);
  }
  try {
    var sourceCode = fs.readFileSync(fileName).toString();
  } catch (e) {
    console.log(
      `An error has occured, please make sure file ${fileName} exists.`
    );
    return 1;
  }

  var value = compileModule.processCode(sourceCode, userRules, 0, getFileName(fileName).slice(1)).text;
  let maxAttempets = 5
  for(let i=0; i<maxAttempets && !value; i++) {
    value = compileModule.processCode(sourceCode, userRules, settings).text;
  }

  if (shouldCompile === "xt.js") writeName = writeName.replace(".xt", "");
  writeName = writeName.replace(path.extname(writeName), ".js");
  writeToFile(value, writeName);
};

function unlink(fileName) {
  fs.unlink(fileName, error => {
    if(error){
      if(error.code==='ENOENT') return 1
      return console.log("delete error", {...error});
    }
    global.msg('Deleted.')
  });
}

watcher
  .on("add", localCompile)
  .on("change", localCompile)
  .on('unlink', fileName => unlink(getPathAfterSrc(fileName)))
  .on("error", function (error) {
    console.log("An error has occured error...\n", e);
  });


const startWatching = () => {
  global.msg("Started..");
  rulesFileName = "_extend.js";
  
  var extentions = [["xt"], ["xt", "js"]];
  var currentDirectory = process.cwd()
  
  rulesfullName = path.join(currentDirectory, rulesFileName);

  userRules = getUserRules(rulesfullName);

  settingsFile = getSettingsFile(rulesfullName)
  settings = {...defaultSettings, ...settingsFile.settings}
  folders = [settings.srcFolder, settings.distFolder]

  srcDirectory = path.join(currentDirectory, folders[0]);
  watcher.add(srcDirectory)
  watcher.add(path.join(process.cwd(), rulesFileName))
}



let oldWay = false

if (oldWay) {
  console.log("Started(old)...");
  var userRules = getUserRules(rulesfullName);
  watcher.add(srcDirectory);
} else {
  startWatching()
}



// testing
// setTimeout(() => {
//   process.exit()
// }, 220)
