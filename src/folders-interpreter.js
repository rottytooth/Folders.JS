/*
 * FOLDERS.JS (with tracking for debugger)
 * Interpreter for the Folders language, using brackets in the place of folders
 * Created 2020 Daniel Temkin danieltemkin.com
 */

var folders = {};
folders.vars = {};

var depth = 0;
var childnum = 0;

var interval = 500;

folders.commands = { IF: "if", WHILE: "while", DECLARE: "declare", LET: "let", PRINT: "print", INPUT: "input", BLOCK: "block" };

folders.expressions = { VARIABLE: "variable", ADD: "add", SUBTRACT: "subtract", MULTIPLY: "multiply", DIVIDE: "divide", LITERAL: "literal", EQUALS: "equals", GREATER: "greater", LESS: "less" };

folders.types = { INT: "int", FLOAT: "float", STRING: "string", CHAR: "char"};

folders.commandNode = (location, commandtype, parent) => {
    var isLoop = (commandtype === folders.commands.WHILE);
    return {
        location: location,
        isCommand: true,
        commandtype: commandtype,
        isLoop: isLoop,
        parent: parent,
        nextsib: null,
        children: []
    };
}

folders.exprNode = (location, exprtype, parent) => {
    return {
        location: location,
        isCommand: false,
        exprtype: exprtype,
        parent: parent,
        nextsib: null,
        children: []
    };
}

folders.root = folders.commandNode([0], folders.commands.BLOCK, null);


folders.interpret = (text) => {
    arraylist = eval(text); // assumes json is clean, only has brackets

    // first array should be a command list
    folders.buildCommandList(arraylist, folders.root);
}

folders.buildCommandList = (arraylist, holderNode) => {
    for(var i = 0; i < arraylist.length; i++) {
        folders.buildCommand(arraylist[i], holderNode, i)
        if (i > 0) {
            holderNode.children[i-1].nextsib = holderNode.children[i];
        }
    }
}

// folder location how we're naming them
folders.friendlyLoc = (arr) => {
    retStr = "";
    for(var l = 0; l < arr.length; l ++) {
        if (l > 0) retStr += "\\";
        retStr += "New folder"
        if (arr[l] > 0)
            retStr += " (" + (arr[l] + 1) + ")";
    }
}

folders.buildCommand = (command, parent, sibidx) => {
    if (command.length < 2) {
        throw "Not enough subdirectories to define command at location " + folders.friendlyLoc([...parent.location].concat(sibidx));
    }
    // get command type
    switch(command[0].length) {
        case 0: // if
            ifnode = folders.commandNode(parent.location.push(sibidx), folders.commands.IF, parent);
            ifnode.expression = folders.buildExpr(command[1], ifnode, 1);
            parent.children.push(ifnode);
            folders.buildCommandList(command[2], ifnode);

            // if (folders.parseExpr(command[1])) {
            //     folders.runCommandList(command[2]);
            // }
            break;
        case 1: // while
            whilenode = folders.commandNode([...parent.location].concat(sibidx), folders.commands.WHILE, parent);
            whilenode.expression = folders.buildExpr(command[1], whilenode, 1);
            parent.children.push(whilenode);
            folders.buildCommandList(command[2], whilenode);

            // while (folders.parseExpr(command[1])) {
            //     folders.runCommandList(command[2]);
            // }
            break;
        case 2: //declare
            // var varname = String(command[1].length);
            // if (varname in folders.vars) {
            //     throw "variable name " + varname + " already exists";
            // }
            // folders.vars[varname] = { 
            //     'type': command[2].length, 
            //     'value': 0 
            // };
            declarenode = folders.commandNode([...parent.location].concat(sibidx), folders.commands.DECLARE, parent);
            declarenode.varname = command[1].length;
            declarenode.type = command[2].length; // type is just a number?
            parent.children.push(declarenode);

            break;
        case 3: // let
            // var varname = String(command[1].length);
            // if (!(varname in folders.vars)) {
            //     throw "variable name " + varname + " not declared";
            // }
            // folders.vars[varname].value = folders.parseExpr(command[2]); 

            // if (folders.vars[varname].type == 1) { //float
            //     folders.vars[varname].value2 = command[3].length;
            // }
            letnode = folders.commandNode([...parent.location].concat(sibidx), folders.commands.LET, parent);
            letnode.varname = command[1].length;
            letnode.expression = folders.buildExpr(command[2], letnode, 2);
            parent.children.push(letnode);

            break;
        case 4: // print
            printnode = folders.commandNode([...parent.location].concat(sibidx), folders.commands.PRINT, parent);
            printnode.expression = folders.buildExpr(command[1], printnode, 1);
            parent.children.push(printnode);
 
            // console.log(folders.parseExpr(command[1]));
            break;
        case 5: // input
            // FIXME: this does not work for types at all
            // readline.question("", response => {
            //     folders.vars[command[1].length].value = response;
            //     readline.close();
            //   });
            inputnode = folders.commandNode([...parent.location].concat(sibidx), folders.commands.INPUT, parent);
            inputnode.varname = command[1].length;
            parent.children.push(inputnode);

            break;
        default:
            throw "could not determine command at location " + folders.friendlyLoc([...parent.location].concat(sibidx));
    }
}

folders.getTwoChildren = (expr, node) => {
    node.children.push(folders.buildExpr(expr[1], node, 1));
    node.children.push(folders.buildExpr(expr[2], node, 2));
    node.children[0].nextsib = node.children[1];
}

folders.buildExpr = (expr, parentnode, sibidx) => {
    if (expr.length < 2) {
        throw "Not enough subdirectories to define expression at location " + folders.friendlyLoc([...parent.location].concat(sibidx));
    }

    switch(expr[0].length) {
        case 0: // variable
            var varNode = folders.exprNode([...parentnode.location].concat(sibidx), folders.expressions.VARIABLE, parentnode);
            varNode.varName = expr[1].length;
            return varNode;
//            var ret = folders.vars[String(expr[1].length)];
//            return folders.getTypedValue(ret.type, ret.value);
        case 1: // add
            var addNode = folders.exprNode([...parentnode.location].concat(sibidx), folders.expressions.ADD, parentnode);
            folders.getTwoChildren(expr, addNode);
            return addNode;
            // return folders.parseExpr(expr[1]) + folders.parseExpr(expr[2]);
        case 2: // subtract
            var subNode = folders.exprNode([...parentnode.location].concat(sibidx), folders.expressions.SUBTRACT, parentnode);
            folders.getTwoChildren(expr, subNode);
            return subNode;
            // return folders.parseExpr(expr[1]) - folders.parseExpr(expr[2]);
        case 3: // multiply
            var mulNode = folders.exprNode([...parentnode.location].concat(sibidx), folders.expressions.MULTIPLY, parentnode);
            folders.getTwoChildren(expr, mulNode);
            return mulNode;
            // return folders.parseExpr(expr[1]) * folders.parseExpr(expr[2]);
        case 4: // divide
            var divNode = folders.exprNode([...parentnode.location].concat(sibidx), folders.expressions.DIVIDE, parentnode);
            folders.getTwoChildren(expr, divNode);
            return divNode;
            // return folders.parseExpr(expr[1]) / folders.parseExpr(expr[2]);
        case 5: // literal
            var literalNode = folders.exprNode([...parentnode.location].concat(sibidx), folders.expressions.LITERAL, parentnode);
                switch(expr[1].length) {
                case 0: // int
                    literalNode.type = folders.types.INT;
                    literalNode.value = folders.getTypedValue(expr[1].length, folders.buildValue(expr[2]));
                    return literalNode;
                case 3: // char
                    literalNode.type = folders.types.CHAR;
                    literalNode.value = folders.getTypedValue(expr[1].length, folders.buildValue(expr[2]));
                    return literalNode;
                case 1: // float
                    literalNode.type = folders.types.FLOAT;
                    literalNode.value = folders.getTypedValue(expr[1].length, "" + folders.buildValue(expr[2]) + "." + buildValue(expr[3]));
                    return literalNode;
                case 2: // string
                    literalNode.type = folders.types.STRING;
                    literalNode.value = expr[2].map(function(chr) {
                        return folders.getTypedValue(3 /* char */, folders.buildValue(chr));
                    }).join("");
                    return literalNode;
                default:
                    throw "could not determine type of literal at location " + folders.friendlyLoc([...parent.location].concat(sibidx));
            }
        case 6: // equal to
            var eqNode = folders.exprNode([...parentnode.location].concat(sibidx), folders.expressions.EQUALS, parentnode);
            folders.getTwoChildren(expr, eqNode);
            return eqNode;
            // return folders.parseExpr(expr[1]) == folders.parseExpr(expr[2]);
        case 7: // greater than
            var gtNode = folders.exprNode([...parentnode.location].concat(sibidx), folders.expressions.GREATER, parentnode);
            folders.getTwoChildren(expr, gtNode);
            return gtNode;
            // return folders.parseExpr(expr[1]) > folders.parseExpr(expr[2]);
        case 8: // less than
            var ltNode = folders.exprNode([...parentnode.location].concat(sibidx), folders.expressions.LESS, parentnode);
            folders.getTwoChildren(expr, ltNode);
            return ltNode;
            // return folders.parseExpr(expr[1]) < folders.parseExpr(expr[2]);
        default:
            throw "could not determine expression at location " + folders.friendlyLoc([...parent.location].concat(sibidx));
    }
}

// FIXME: all of this is definitely wrong
folders.getTypedValue = (type, value) => {
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
            throw "could not determine type at location" + folders.friendlyLoc([...parent.location].concat(sibidx));
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
folders.buildValue = (numbr) => {
    var fullnum = numbr.map(function(hexdigit){
        return hexdigit.map(function(bit) {
            return bit.length;
        }).join("");
    }).join("");

    // convert to decimal and return
    var digit = parseInt(fullnum, 2);
    return digit;
}
