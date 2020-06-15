
var folders = {};
folders.vars = {};

const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

folders.interpret = function(text) {
    arraylist = eval(text); // assumes json is clean, only has brackets

    // TODO: some tracing of where we are in the program, equivalent of line numbers

    // first array should be a command list
    folders.runCommandList(arraylist);
}

folders.runCommandList = function(arraylist) {
    arraylist.forEach(folders.runCommand);
}

folders.runCommand = function(command) {
    if (command.length < 2) {
        throw "Not enough subdirectories to define command";
    }
    // get command type
    switch(command[0].length) {
        case 0: // if
            if (folders.parseExpr(command[1])) {
                folders.runCommandList(command[2]);
            }
            break;
        case 1: // while
            while (folders.parseExpr(command[1])) {
                folders.runCommandList(command[2]);
            }
            break;
        case 2: //declare
            var varname = String(command[1].length);
            if (varname in folders.vars) {
                throw "variable name " + varname + " already exists";
            }
            folders.vars[varname] = { 
                'type': command[2].length, 
                'value': 0 
            };
            break;
        case 3: // let
            var varname = String(command[1].length);
            if (!(varname in folders.vars)) {
                throw "variable name " + varname + " not declared";
            }
            folders.vars[varname].value = folders.parseExpr(command[2]); 

            if (folders.vars[varname].type == 1) { //float
                folders.vars[varname].value2 = command[3].length;
            }
            break;
        case 4: // print
            console.log(folders.parseExpr(command[1]));
            break;
        case 5: // input
            // FIXME: this does not work for types at all
            readline.question("", response => {
                folders.vars[command[1].length].value = response;
                readline.close();
              });
            break;
        default:
            throw "could not determine command";
    }
}

folders.parseExpr = function(expr) {
    if (expr.length < 2) {
        throw "Not enough subdirectories to define expression";
    }

    switch(expr[0].length) {
        case 0: // variable
            var ret = folders.vars[String(expr[1].length)];
            return folders.getTypedValue(ret.type, ret.value);
        case 1: // add
            return folders.parseExpr(expr[1]) + folders.parseExpr(expr[2]);
        case 2: // subtract
            return folders.parseExpr(expr[1]) - folders.parseExpr(expr[2]);
        case 3: // mulitply
            return folders.parseExpr(expr[1]) * folders.parseExpr(expr[2]);
        case 4: // divide
            return folders.parseExpr(expr[1]) / folders.parseExpr(expr[2]);
        case 5: // literal
            switch(expr[1].length) {
                case 0: // int
                case 3: // char
                    return folders.getTypedValue(expr[1].length, folders.buildValue(expr[2]));
                case 1: // float
                    return folders.getTypedValue(expr[1].length, "" + folders.buildValue(expr[2]) + "." + buildValue(expr[3]));
                case 2: // string
                    return expr[2].map(function(chr) {
                        return folders.getTypedValue(3 /* char */, folders.buildValue(chr));
                    }).join("");
                default:
                    throw "could not determine type of literal";
            }
        case 6: // equal to
            return folders.parseExpr(expr[1]) == folders.parseExpr(expr[2]);
        case 7: // greater than
            return folders.parseExpr(expr[1]) > folders.parseExpr(expr[2]);
        case 8: // less than
            return folders.parseExpr(expr[1]) < folders.parseExpr(expr[2]);
        default:
            throw "could not determine expression";
    }
}

// FIXME: all of this is definitely wrong
folders.getTypedValue = function(type, value) {
    switch(type) {
        case 0: // int
            return parseInt(value);
        case 1: // float
            return parseFloat(value);
        case 2: // string
            return String(value);
        case 3: // char
            return String.fromCharCode(value)[0];
        default:
            throw "could not determine type";
    }
}

// The value is stored in an additional folder, the mapping is like this:
//  - each subfolder is 4 bits
//  - each of these subfolders has (up to) 4 folders, each containing a bit (let's call them sub-sub-folders)
//  - if the sub-sub-folder has a folder, it's a 1, otherwise, it's a zero
//
// So like this:
// ---- 0
// |
// ----|----1
// |
// ---- 0
// |
// ----|--- 1
// Equals 0101, or 0x5 for the first entry
folders.buildValue = function(numbr) {
    var fullnum = numbr.map(function(hexdigit){
        return hexdigit.map(function(bit) {
            return bit.length;
        }).join("");
    }).join("");

    // convert to decimal and return
    var digit = parseInt(fullnum, 2);
    return digit;
}

// NODE entry point
if (process.argv.length < 3) {
    console.log("no file passed");
    process.exit(1);
}
var progt = require("fs");
var filename = process.argv[2];
progt.readFile(filename, 'utf8', function(err, text) {
    if (err) throw err;
    console.log("OK:" + filename);
    folders.interpret(text);
});

