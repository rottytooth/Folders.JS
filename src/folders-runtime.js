folders.runtime = {};

folders.runtime.interval = 500; // FIXME: connect to slider

folders.runtime.fromChild = false;

folders.runtime.callstack = { name: "Call Stack", children: []};

folders.runtime.varlist = [];

folders.runtime.popcallstack = (node) => {
    if (!node.children || node.children.length == 0) {
        node = null;
    }
    else {
        folders.runtime.popcallstack(node.children[0]);
    }
}

folders.runtime.pushcallstack = (node, newnode) => {
    if (!node.children || node.children.length == 0) {
        node.chldren = [];
        node.children.push(newnode);
    }
    else {
        folders.runtime.pushcallstack(node.children[0], newnode);
    }
}

folders.runtime.begin = (rootNode) => {
    folders.runtime.varlist = []; // reset
    folders.runtime.fromChild = false;

    folders.runtime.node = rootNode;

    folders.runtime.workInterval = setInterval(() => {
        folders.runtime.processNode();
    }, folders.runtime.interval);
}

folders.runtime.resolveExpr = (expr) => {
    switch(expr.exprtype) {
        case folders.expressions.LITERAL:
            return expr.value;
    }
}

folders.runtime.processNode = () => {

    var node = folders.runtime.node;
    // if this, we've already done the test
    if (folders.runtime.fromChild && !node.isLoop) {
        folders.runtime.fromChild = false;
        folders.runtime.setNext();
    } else {
        folders.runtime.fromChild = false;
        // do the command
        // var out = document.getElementById("out")
        // out.innerHTML += folders.runtime.node.command + "<br/>";

        // app.message += folders.runtime.node.command + "<br/>";
        // if (Math.floor(Math.random() * 3) === 0) {
        //     secondDiv.message += folders.runtime.node.command + "<br/>";
        // }

        // mark where we are in the source code

        // report the location to stack display
        var activeFolder = document.getElementById(node.location.join("-"));
        sourceWindow.selectFolder(activeFolder);
        activeFolder.scrollIntoView();
        window.scrollTo(0,0);

        folders.runtime.pushcallstack(folders.runtime.callstack,{ name: node.commandtype, children: []});

        switch(node.commandtype) {
            // case folders.commands.IF:
            // case folders.commands.WHILE:
            case folders.commands.DECLARE:
                if (node.varname in folders.runtime.varlist) {
                    cmdWindow.println("ERROR: Varname already in use " + varname);
                    clearInterval(folders.runtime.workInterval); // halt program
                }
                folders.runtime.varlist[node.varname] = null;
                break;
            case folders.commands.PRINT:
                cmdWindow.println(folders.runtime.resolveExpr(node.expression), false);
            
        }

        // do test of if or while or whatever and if yes, call children
        // otherwise call next sibling
        if (folders.runtime.node.children && folders.runtime.node.children.length > 0) {
            folders.runtime.node = folders.runtime.node.children[0];
            folders.runtime.fromChild = false;
        }
        else { // either hasn't children or has failed test
            folders.runtime.popcallstack(folders.runtime.callstack);
            folders.runtime.setNext();
        }
        dataWindow.drawNamedFolders([folders.runtime.callstack], null, true);
    }
}

folders.runtime.setNext = () => {
    if (folders.runtime.node.nextsib) {
        folders.runtime.node = folders.runtime.node.nextsib;
        folders.runtime.fromChild = false;
    }
    else if (folders.runtime.node.parent) {
        folders.runtime.node = folders.runtime.node.parent;
        folders.runtime.fromChild = true;
        // fire immediately, as we've already waited
        folders.runtime.processNode();
    } else {
        clearInterval(folders.runtime.workInterval);
    }
}
