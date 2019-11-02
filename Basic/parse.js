// Compiler using mustache syntax
let userRules = require('./userRules').rules
let runRules = require('./runRules')


exports.extracteur = (sourceCode, exeluding, strings, depth=0, full=1) => {
    // extract code that needs processing
    const find = (str, needle, i) => (str.slice(i,i+needle.length)===needle)
    const range = (s, e) => {
        let array = []
        for (let i = s; i < e; i++) { array.push(i) }
        return array
    }

    const strChars = ['"', "'", '`']
    var ingoreI = []
    var isOpen = false
    var inStr = {is: false, char: ''}
    var accum = ''
    var block = { text: '', succ: 1, }
    for (let i = 0; i < sourceCode.length; i++) {
        let letter = sourceCode[i];
        if(ingoreI.includes(i)){
            continue;
        }
        
        if(strChars.includes(letter)){
            if(!inStr.is){ //start
                inStr.char = letter;
            } else if(inStr.is && inStr.char===letter){ //end
                inStr.char='';
            }
            inStr.is = !inStr.is
            block.text += letter
            continue
        }
        if(inStr.is){
            block.text += letter
            continue
        }

        let foundOpen = find(sourceCode, exeluding[0], i)
        let foundClose = find(sourceCode, exeluding[1], i)
        if( foundOpen ){
            var res = this.extracteur(sourceCode.slice(i+exeluding[0].length), exeluding, '', depth+1, false )
            if(res.text){
                block.text += compileMAIN(res.text, userRules) || ''
                ingoreI.push( ...range(i, i + res.len + 2 * exeluding[1].length ) )
            }
        } else if(foundClose){
            ingoreI.push( ...range(i, i + exeluding[1].length) )
            let comp = 
            accum ? block.text += compileMAIN(accum, userRules) : null
            block.len = i
            if(!full) {
                block.end = 111
                return block
            }
        } else if(isOpen) {
            accum += letter
        }else if(false){

        }else if(!isOpen){
            block.text += letter
        }
    }
    accum ? block.text += compileMAIN(accum, userRules) : 0
    block.end = true
    return block
}


let handleRules = () => {
    for (const rule of userRules) {
        rule.parsed = runRules.parseTemp(rule.template)
    }
}
handleRules()

const compileMAIN = (sourceCode, userRules) => {
    try{
        let code = runRules.parseCode(sourceCode)
        let rules = GETTHERIGHTRULES(code, userRules)
        for (const rule of rules) {
            let obj = getVARS(rule.parsed, code)
            let result = rule.output(obj)
            if(result!==false){
                return result
            }
        }
    }catch(e){
        console.log('An error has occured, please double check your rules.', e)
    }
}

const GETTHERIGHTRULES = (code, userRules) => {
    let matching = []
    for (const rule of userRules) {
        rule.words = rule.parsed.filter(el => el.type !== 'var')
        let passing = true 
        for( let word of rule.words ) {
            for( let foundWord of code ) {
                if( word.value!==foundWord.value ){
                    passing = false;
                    continue;
                }
                passing = true
                break;
            }
            if(!passing){break}
        }
        if(passing){ matching.push(rule) }
    }
    return matching
}

const getVARS = (template, found) => {
    // all compiling is done here
    // template array of parts/words of some rule
    // found is array of actuall source code (after some processing)
    // vars is the object returned containing all variables extracted
    // adj is a cursor to keep up with different indexes between template and found eg: variable more than one word
    let vars = {}
    let inVar = false
    let adj = 0
    let skipI = false
    for (let i = 0; i < template.length; i++) {
        let tempWord = template[i];
        lastInVar = inVar
        inVar =  tempWord.type === 'var'
        if(skipI){
            skipI = false
            continue
        }
        for (let j = i+adj; j < found.length; j++) {
            const foundWord = found[j];
            // todo there is probably a better way to do this

            // am i looking at the next word in template? take a step back
            if( template[i+1] && template[i+1].value === foundWord.value){
                skipI = true
                adj--
                break
            }
            // am i looking at the current word in template? this means im done 
            if( tempWord.type!=='var' && tempWord.value === foundWord.value ){
                break
            }
            
            adj++
            if(inVar){
                vars[tempWord.value] = (vars[tempWord.value]||'')
                vars[tempWord.value] += (foundWord.value)
                vars[tempWord.value] = vars[tempWord.value].trim()
            }
        }
    }
    return vars
}




// some tests
console.log(
    // compileMAIN('arr [2]', userRules),
    // compileMAIN('arr [2, -3,4]', userRules),
    // compileMAIN('(arg1, arg2) -> {func1(); funct2()}', userRules),
    // compileMAIN('let w1.w2 = w3.w4', userRules),
    // compileMAIN('for j to 100: { xx({a:2}) }', userRules),
)