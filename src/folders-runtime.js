folders.runtime = {};

folders.runtime.interval = 500; // FIXME: connect to slider

folders.runtime.fromChild = false;

folders.runtime.callstack = [ { name: "Call Stack" }];

folders.runtime.begin = (rootNode) => {

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

        folders.runtime.callstack.push({ name: node.commandtype});

        switch(node.commandtype) {
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
            folders.runtime.callstack.pop();
            folders.runtime.setNext();
        }
        dataWindow.drawNamedFolders(folders.runtime.callstack);
    }
}

folders.runtime.setNext = () => {
    if (folders.runtime.node.sibling) {
        folders.runtime.node = folders.runtime.node.sibling;
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
