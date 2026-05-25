"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.text = void 0;
const path = require("path");
exports.text = [
    {
        file: "_extend.js",
        text: `const settings = {
  srcFolder: 'src',
  distFolder: 'dist',
  codeOpening: '\`{{',
  codeClosing: '}}\`',
  variableOpening: '{',
  variableClosing: '}',
  arrayOpening: '[',
  arrayClosing: ']',
  escapeCharacter: '#',
  vscodeHighlighting: true
}

const ident = /^[a-zA-Z_$][\\w$]*$/

const types = {
  int: /^\\d+$/,
  ident,
  any: () => true,
}

const rules = [
  // ── Python ────────────────────────────────────────────────────────────────
  {
    id: 'py dict comprehension',
    template: 'Object.fromEntries(#[ #[{key}, {val}#] for {elName} in {iterable} #])',
    output: ({ iterable, elName, key, val }) =>
      \`Object.fromEntries(\${iterable.trim()}.map(\${elName.trim()} => [\${key.trim()}, \${val.trim()}]))\`,
  },
  {
    id: 'py list comprehension',
    template: '#[ {el} for {elName} in {iterable} #]',
    output: ({ iterable, el, elName }) =>
      \`\${iterable.trim()}.map(\${elName.trim()} => \${el.trim()})\`,
  },
  {
    id: 'py slice',
    template: '{array} #[{start}:{end}#]',
    output: ({ array, start, end }) => {
      start = (start || '0').trim()
      end = end.trim()
      if (!end) return \`\${array.trim()}.slice(\${start})\`
      return \`\${array.trim()}.slice(\${start}, \${end})\`
    },
  },
  {
    id: 'py index',
    template: '{array} #[{i}#]',
    output: ({ array, i }) => {
      i = i.trim()
      if (i.includes(':')) return false
      if (/^-\\d+$/.test(i)) return \`\${array.trim()}[\${array.trim()}.length \${i}]\`
      return \`\${array.trim()}[\${i}]\`
    },
  },
  {
    id: 'py range 2',
    template: 'range(#{start}, {end}#)',
    output: ({ start, end }) =>
      \`[...Array(\${end.trim()} - \${start.trim()}).keys()].map(i => i + \${start.trim()})\`,
  },
  {
    id: 'py range 1',
    template: 'range({n})',
    output: ({ n }) => \`[...Array(\${n.trim()}).keys()]\`,
  },
  {
    id: 'py conditional',
    template: '{then} if {cnd} else {otherwise}',
    output: ({ then, cnd, otherwise }) =>
      \`(\${cnd.trim()} ? \${then.trim()} : \${otherwise.trim()})\`,
  },
  // ── Rust ──────────────────────────────────────────────────────────────────
  {
    id: 'rust unwrap-or',
    template: '{expr}.unwrap_or({default})',
    output: ({ expr, default: d }) => \`(\${expr.trim()} ?? \${d.trim()})\`,
  },
  {
    id: 'rust if-let',
    template: 'if let {name} = {expr}#{{code}#}',
    output: ({ name, expr, code }) =>
      \`if (\${expr.trim()} != null) { const \${name.trim()} = \${expr.trim()}; \${code} }\`,
  },
  {
    id: 'rust fn',
    template: 'fn {name}({params})#{{body}#}',
    output: ({ name, params, body }) =>
      \`function \${name.trim()}(\${params.trim()}) {\\n\${body}\\n}\`,
  },

  // ── Nim ───────────────────────────────────────────────────────────────────
  {
    id: 'nim range',
    template: '{start}..{end}',
    output: ({ start, end }) =>
      \`[...Array(\${end.trim()} - \${start.trim()} + 1).keys()].map(i => i + \${start.trim()})\`,
  },
  {
    id: 'nim echo',
    template: 'echo {expr}',
    output: ({ expr }) => \`console.log(\${expr.trim()})\`,
  },
  {
    id: 'nim when',
    template: 'when {expr}: #{ {code} #}',
    output: ({ expr, code }) => \`if (\${expr.trim()}) { \${code} }\`,
  },

  // ── Zig ───────────────────────────────────────────────────────────────────
  {
    id: 'zig for',
    template: 'for ({items}) |{item}| #{{body}#}',
    output: ({ items, item, body }) =>
      \`for (const \${item.trim()} of \${items.trim()}) {\\n\${body}\\n}\`,
  },
  {
    id: 'zig orelse',
    template: '{expr} orelse {default}',
    output: ({ expr, default: d }) => \`(\${expr.trim()} ?? \${d.trim()})\`,
  },
]

module.exports = { rules, settings, types }`
    },
    {
        file: path.join("./src", "demo.xt.js"),
        text: `// Polyglot JS — Python, Rust, Nim, and Zig idioms compiled to plain JS.

const employees = [
  { name: 'Alice', salary: 1000 },
  { name: 'Bob', salary: 1320 },
  { name: 'Carol', salary: 1620 },
]

// Python
const salaries = \`{{ [e.salary for e in employees] }}\`
const topTwo = \`{{ salaries[0:2] }}\`
const lastSalary = \`{{ salaries[-1] }}\`
const bonus = \`{{ 500 if lastSalary > 1500 else 200 }}\`
const byName = \`{{ Object.fromEntries([[e.name, e.salary] for e in employees]) }}\`

// Rust
const maybeName = employees[0]?.name ?? null
\`{{ if let name = maybeName { console.log(name) } }}\`
const add = \`{{ fn add(a, b){ return a + b } }}\`

// Nim
const nimRange = \`{{ 1..5 }}\`
\`{{ echo nimRange.join('-') }}\`
\`{{ when salaries.length:{ print('payroll ready') } }}\`

// Zig
const tags = ['js', 'extend', 'polyglot']
\`{{ for (tags) | tag |{  print(tag) } }}\`
const fallback = \`{{ null orelse 'default' }}\`

console.log({ salaries, topTwo, lastSalary, bonus, byName, add, nimRange, fallback })`
    }
];
