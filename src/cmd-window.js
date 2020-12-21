/*
 * A Windows-style terminal (cmd) window (a kind of winwin)
 */
function createCmdWindow(name, top, left, title) {

    var cmdWindow = new winwin(name, top, left);

    cmdWindow.currentPath = "FLDR";

    cmdWindow.draw = function(active) {
        this.redraw(active);

        // title
        this.headerPane.innerText = title;

        // cmd_inner is where the actual content appears, the black div
        this.wininner.classList.add("cmd_inner");

        // this is the structure of the window
        this.winframe.classList.add("cmd_frame");

        // this holds only the text, is inline
        this.textContent = document.createElement("div");
        this.textContent.classList.add("cmd_content");
        this.wininner.appendChild(this.textContent);

        this.userTypedContent = document.createElement("div");
        this.userTypedContent.setAttribute("contenteditable", "true");
        this.userTypedContent.classList.add("cmd_content");
        this.wininner.appendChild(this.userTypedContent);
    }

    cmdWindow.makeActive = () => {
        cmdWindow.userTypedContent.focus();
    }

    // activated by users typing new content
    cmdWindow.userprint = (content) => {
        if (content == "\r" || content == "\n"){
            var commandToProcess = cmdWindow.userTypedContent.innerText;

            // move that content into the "not current line" text
            cmdWindow.println(commandToProcess, true);
            cmdWindow.userTypedContent.innerText = "";

            // FIXME: this is where we actually process the command that's been entered

            commandToProcess = commandToProcess.toLowerCase().trim();

            if (commandToProcess.startsWith('load ')) {
                // this is loading a program
                var programToLoad = commandToProcess.toUpperCase().substring('load '.length);
                cmdWindow.loadProgram(programToLoad);
            }
            else if (commandToProcess == 'folders .') {
                // run the interpreter on the currently loaded program
                folders.interpret(sourceWindow.folders);
            } 
            else {
                cmdWindow.println("Command not found");
            }
            cmdWindow.println("", false, false); // invoke next prompt
        }

        // scroll to bottom, to show newly added text
        cmdWindow.wininner.scrollTo(0, cmdWindow.wininner.scrollHeight);
    }

    cmdWindow.loadProgram = (programName) => {
        cmdWindow.println("Loading program " + programName + "...");
        fileName = programName.toLowerCase().replace(/\s/g, '');
        sourceWindow.getProgram(programName, "programs/" + fileName + ".json");
    }

    // this "system print," all print proceeding the command currently being entered
    cmdWindow.println = (content, suppressPrompt = true, newline = true) => {
        if (!suppressPrompt) {
            cmdWindow.textContent.appendChild(document.createTextNode(cmdWindow.currentPath + "> "));
        }
        cmdWindow.textContent.appendChild(document.createTextNode(content));
        if (newline) {
            cmdWindow.textContent.appendChild(document.createElement("br"));
        }
    }

    cmdWindow.printHeading = function() {
        var version = 0.20;
        this.println("Folders Interpreter / FFS Emulator [Version " + version + "]", true);
        this.println("Creative Commons CC-BY-4.0 (2020) Daniel Temkin", true);
        this.println("", true);
        this.println("A Windows-based File System and Programming Language offering infinite data storage in finite space", true);
        this.println("", true);
        this.println("Type 'dir' to see list of pre-loaded programs", true);
        this.println("Type 'load [path]' to load a local folders program", true);
        this.println("Type 'folders .' to run Folders on the current directory", true);

        this.println("", true);
        this.println("", false);
    }

    return cmdWindow;
}

// typing (for when we're in the command window)
function keyevents(e) {
    if (cmdWindow.active) {
        var code = e.keyCode || e.which;
        cmdWindow.userprint(String.fromCharCode(code));
        if (e.keyCode == 13)
            e.preventDefault();
        return true;
    }

    if (e.keyCode == 8) return false;
    return true;
}

document.onkeypress = keyevents;
document.onkeydown = keyevents;