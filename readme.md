# Extend

Extend is the tool to bring your ideas into reality,

You can use Extend to introduce new syntax/features to the language of your choice in the matter of minutes.
## Installation
To get started you need to install Extend using 
```
npm install -g extendx@0.3.1
```
Please note we are going to use the name extend<u>x</u> for the cli for now.

Syntax highlighting is under development and is partially supported on vscode, to start using it launch the command palette using `CTRL`+`P` and enter the command 

```
ext install fabiospampinato.vscode-highlight
```

this will install the extension [here](https://marketplace.visualstudio.com/items?itemName=fabiospampinato.vscode-highlight "Vscode highlight extension"), note this is going to write to .vscode/settings.json of your wokrspace, so you might want to backup this file.

## Usage

To create your first project use the command 

```
extendx --start
```
which is going to create a basic project for you to start with.

The first thing that you are going to need is the `_extend.js` file inside your root directory,
this is where your *rules* live and is just a normal javascript with a few exports, one of which is `rules`, more about that in a second.

The compiler will then look for code inside your `src` folder, only files with extensions `.xt` or `.xt.js` will be processed.
in this stage of development, the compiler will require a character or more to indicate blocks of code that will require compiling.

in this example we used the mustache syntax, but it's up to you to choose any syntax you like, you might want to use multiline string / comment syntax of your programming language to avoid your code being highlighted as an error by your IDE.

eg:&nbsp; `var salaries = {{ [employee.salary for employee in employees] }}`

Once done, the compiler will write the processed version of your code to `dist` folder.



## Working with rules

Each rule is a js `Object` consisting of two parts: `template` and `output`.
`template` is what the compiler is going to looking for, it describes what your rule looks like. let's take python slicing for example:

`{array} #[{start}:{end}#]`


Here we have declared three variables `array`, `start` and `end`, using the syntax `{variableName}`, as you can see we have escaped the squared brackets, otherwise, the compiler would treat variable differently, specifically as an array, but let's not worry about that now.

To start using these variables, you will need the second part of the rule, the `output`.

```javascript
function ({ array, start, end }) {
  return `${array}.slice(${start}, ${end})`
}
```


The `output` is a normal javascript function that receives an object containing all variables that the compiler found, it can be a good idea to use destructuring here.

The return of this function is what the compiler is going write to your code. if for any reason you think that something went wrong and you don't want to process this code, eg: variable is undefined, or it's conflicting with a different rule, you need to return `false`.

One last thing you need to know is the escape character is the `#` sign, which you have already seen.



Feel free to try it live on http://extend.netlify.com/ (might be out of date).
<br/>
<br/>


#### Arrays
An array is a special type of variable that matches a repetitive syntax which is then as an... *ahem* array

here is an example for a rule that extracts html attributes using one.
```javascript
rule.template = '<{elementName} {attributesArray}["{attrName}"="{value}"] />'
```


## `_extend.js` file
`_extend.js` is a file that lives in your projects root directory and has 3 exports: `rules`, `settings` for the `compiler`, as well as `types`.


### Settings
The default settings are as follows, note that `codeOpening` and `codeClosing` are for your source code files and are used to highlight code that needs to be processed, you can use whatever you want, or you can use the string / comment syntax of your programming language as mentioned above, note that you want to use two different strings for opening and closing.

`variableOpening`, `variableClosing`, `arrayOpening`, and `arrayClosing` all apply to your templates, inside your `_extend.js` file.

```javascript
module.exports.settings = {
  srcFolder: 'src',
  distFolder: 'dist',
  codeOpening: '`{{',
  codeClosing: '}}`',
  variableOpening: '{',
  variableClosing: '}',
  arrayOpening: '[',
  arrayClosing: ']',
  escapeCharacter: '#',
  vscodeHighlighting: true
}
```

### Types
Types is a object that serves as a way for you to control what each of your variables should like. each type will have a name which is going to be used inside your `_extend.js` file, the value can either be a Regex or a js function which receives the variable, and returns `true` if the variable fits the requirements.

\[experimental\]: You can return a string from the type function which is going to replace the existing variable. you also receive both the variables block, containing all found variables in this rule, as well as current variable name as the second and third argument, feel free to play around with those.

```javascript
var startsWithA = variable => variable[0].toLowerCase() === 'a'
var startsWithB = variable => variable[0].toLowerCase() === 'b'
module.exports.types = {
  int: /^\d+$/,
  float: /^\d+\.\d+$/,
  // matches any thing (useless)
  any: v => true,
  // matches nothing (useless)
  none: v => false,
  // turns all variables into AAAAA (also useless)
  AAAAA: v => 'AAAAA',
  // 'and' + 'or' functions are both included in the starting project
  startsWithAorB: or(startsWithA, startsWithB)
}
```

to use the type you declare your variables as: `{startsWithAorB MyVariable}`, which will only accept variables that match this filter.


## What's new

### 0.3
Syntax highlighting on VSCode is here! (kind of)

### 0.2
Added variable types using regex or js functions.

### 0.1.0
Added array support.

Added rules settings.
