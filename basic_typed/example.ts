const path = require("path");
exports.text = [
  {
    file: "_extend.js",
    text:
`let settings = {
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

const process = (filter, variable) => {
  if(filter instanceof RegExp)
    return variable.match(fitler)
  else if (filter instanceof Function)
    return filter(variable)
}


const and = (...filters) => 
  variable => filters.every( filter => process(filter, variable) )

const or = (...filters) => 
  variable => filters.some( filter => process(filter, variable) )


const startsWithA = variable => variable[0].toLowerCase() === 'a'
const startsWithB = variable => variable[0].toLowerCase() === 'b'
const experimental = (variable, vars, name) => {
  vars.someOtherVariable = 'someOtherValue'
  return variable.slice(0, -3)
}

let types = {
  int: /^d+$/,
  float: /^d+.d+$/,
  // matches any thing (useless)
  any: v => true,
  // matches nothing (useless)
  none: v => false,
  // turns all variables into AAAAA (also useless)
  AAAAA: v => 'AAAAA',
  // 'and' + 'or' functions are both included in the starting project
  startsWithAorB: or(startsWithA, startsWithB)
}

let rules = [
  {
    template: '{array} #[{start}:{end}#]',
    output: ({ array, start, end }) => {
      if(!start) start = 0
      if(!end.trim()) end = ''
      else end = ','+end
      return \`\${array}.slice(\${start} \${end})\`
    }
  },
  {
    template: '{array} #[{i}#]',
    output: ({ array, i }) => {
      i = i.trim()
      if (i.includes(':')) return false
      return \`\${array}[\${i}>0 ? \${i} : \${array}.length+\${i}]\`
    }
  },
  {
    template: '#[ {el} for {elName} in {array} #]',
    output: function ({ array, el, elName }) {
      return \`\${array}.map( \${elName}=> \${el})\`
    }
  },
  {
    template: 'for {i}:{max}#{{code}#}',
    output: ({i,max,code}) => \`for(let \${i}=0; \${i}<\${max}; \${i}++){
  \${code}}\`
  }
]

module.exports = {rules, settings, types}`
  },
  {
    file: path.join("./src", "HelloWorld.xt.js"),
    text:
`let employees = [
  {name: 'emp0', salary: 1000},
  {name: 'emp1', salary: 1320},
  {name: 'emp1', salary: 1320},
  {name: 'emp1', salary: 1620},
  {name: 'emp2', salary: 1500},
  {name: 'emp3', salary: 1100},
  {name: 'emp4', salary: 2000},
]

let salaries = \`{{ [employee.salary for employee in employees] }}\`

console.log(salaries)


\`{{ for i:20 {
  console.log(\`i is: \${i}\`)
} }}\`

console.log(\`last salary is \${\`{{salaries[-1]}}\`}\`)
console.log(\`Array slicing? \${\`{{salaries[1: -2]}}\`}\`)


console.log(\`Unimpressed? feel free to create your own using the _extend.js file.\`)`
  }
];
