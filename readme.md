# Extend

Extend brings the syntax you want to the language of your choice. Write Python list comprehensions, Rust `if let`, Nim ranges, or Zig loops inside JavaScript — Extend compiles them to plain JS.

## Installation

Install Extend globally:

```
npm install -g extendx
```

The CLI is published as **extendx** for now.

**Use this repo locally:** from the repo root run `npm link`. That installs the **`extendx`** command from your checkout (replacing any global npm install until you unlink). After changing TypeScript sources, rebuild with `npm run t`; the symlinked CLI loads `build/watch.js`.

To depend on **extendx** from another project without publishing, run **`npm link extendx`** inside that project's folder (the dependency name is **`extendx`**, matching `"name"` in this package).

Syntax highlighting is partially supported in VS Code. Open the command palette (`CTRL`+`P`) and run:

```
ext install fabiospampinato.vscode-highlight
```

This installs the [vscode-highlight](https://marketplace.visualstudio.com/items?itemName=fabiospampinato.vscode-highlight) extension. It writes to `.vscode/settings.json` in your workspace, so you may want to back that file up first.

## Usage

Create a starter project:

```
extendx --start
```

This scaffolds `_extend.js` (your rules) and `src/demo.xt.js` (a polyglot demo).

The compiler reads files from `src/` with extensions `.xt` or `.xt.js`, finds blocks marked with your code delimiters, applies matching rules, and writes output to `dist/`.

By default, code blocks use backtick-wrapped mustache syntax:

```
const salaries = `{{ [e.salary for e in employees] }}`
```

You can choose any opening/closing markers in `_extend.js` — comment syntax from your target language works well so your IDE does not flag extensions as errors.

## Polyglot demo

The starter project includes rules for idioms from several languages. Source (`src/demo.xt.js`):

```javascript
// Python
const salaries = `{{ [e.salary for e in employees] }}`
const topTwo = `{{ salaries[0:2] }}`
const lastSalary = `{{ salaries[-1] }}`
const bonus = `{{ 500 if lastSalary > 1500 else 200 }}`

// Rust
`{{ if let name = maybeName { console.log(name) } }}`
const add = `{{ fn add(a, b){ return a + b } }}`

// Nim
const nimRange = `{{ 1..5 }}`
`{{ echo nimRange.join('-') }}`

// Zig
`{{ for (tags) | tag |{ print(tag) } }}`
const fallback = `{{ null orelse 'default' }}`
```

Compiled output (`dist/demo.js`):

```javascript
const salaries = employees.map(e => e.salary)
const topTwo = salaries.slice(0, 2)
const lastSalary = salaries[salaries.length - 1]
const bonus = (lastSalary > 1500 ? 500 : 200)

if (maybeName != null) { const name = maybeName; console.log(name) }
const add = function add(a, b) { return a + b }

const nimRange = [...Array(5 - 1 + 1).keys()].map(i => i + 1)
console.log(nimRange.join('-'))

for (const tag of tags) { print(tag) }
const fallback = (null ?? 'default')
```

Run the watcher from your project root:

```
extendx
```

Or compile once from the Extend repo against the bundled `polyglot-js/` example:

```
cd polyglot-js && node ../extend
```

## Working with rules

Each rule is a plain object with `template` and `output`.

`template` describes what to match. Variables use `{variableName}`. Escape special characters with `#` (the default escape character).

Python slicing example:

```
{array} #[{start}:{end}#]
```

`output` is a function that receives the captured variables and returns the replacement string. Return `false` to skip a match (e.g. when a variable is invalid or another rule should win).

```javascript
{
  id: 'py slice',
  template: '{array} #[{start}:{end}#]',
  output: ({ array, start, end }) => {
    start = (start || '0').trim()
    end = end.trim()
    if (!end) return `${array.trim()}.slice(${start})`
    return `${array.trim()}.slice(${start}, ${end})`
  },
}
```

Rules can optionally include an `id` for debugging. See `polyglot-js/_extend.js` for a full ruleset covering Python, Rust, Nim, and Zig.

## `_extend.js` file

`_extend.js` lives in your project root and exports `rules`, `settings`, and `types`.

### Settings

Default settings:

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

- `codeOpening` / `codeClosing` — delimiters in your source files
- `variableOpening` / `variableClosing` — variable syntax in rule templates
- `arrayOpening` / `arrayClosing` — array repetition syntax in templates
- `escapeCharacter` — escapes literal characters in templates (default `#`)

### Types

Types validate or transform captured variables. Each type is a name mapped to a `RegExp` or a function that returns `true`/`false` (or a replacement string).

```javascript
const ident = /^[a-zA-Z_$][\w$]*$/

module.exports.types = {
  int: /^\d+$/,
  ident,
  any: () => true,
}
```

Use a type in a template: `{ident myVar}` — only values matching `ident` are accepted.

[experimental]: Type functions also receive the full variable block and the current variable name. Returning a string replaces the captured value.

## What's new

### 0.3
Syntax highlighting on VSCode is here! (kind of)

### 0.2
Added variable types using regex or js functions.

### 0.1.0
Added array support.

Added rules settings.
