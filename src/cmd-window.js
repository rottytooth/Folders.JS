/*
 * A Windows-style terminal (cmd) window (a kind of winwin)
 */
function createCmdWindow(name, top, left, title) {

    var cmdWindow = new winwin(name, top, left);

    cmdWindow.currentPath = "Program Source";

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
        this.userTypedContent.classList.add("cmd_content");
        this.wininner.appendChild(this.userTypedContent);

        // following the text is the cursor, also inline
        this.cursor = document.createElement("div");
        this.cursor.classList.add("cursor");
        this.wininner.appendChild(this.cursor);
        this.cursor.style.display = 'none'; // hide

        // make the cursor blink
        var blink = document.createElement("div");
        blink.classList.add("blink");
        this.cursor.appendChild(blink);
    }

    cmdWindow.makeActive = () => {
        cmdWindow.cursor.style.display = 'inline-block'; // show
    }

    cmdWindow.makeInactive = () => {
        cmdWindow.cursor.style.display = 'none'; // hide
    }

    // activated by users typing new content
    cmdWindow.userprint = function(content) {
        if (content == "\u0008") {
            var lineOfText = this.userTypedContent.innerText;
            if (lineOfText[lineOfText.length - 1] != '>') {
                this.userTypedContent.innerText = lineOfText.slice(0, -1);
            }
        }
        else if (content == "\r" || content == "\n"){
            var commandToProcess = this.userTypedContent.innerText;

            // move that content into the "not current line" text
            this.println(commandToProcess);
            this.userTypedContent.innerText = "";

            // FIXME: this is where we actually process the command that's been entered

            if (commandToProcess.toLowerCase().startsWith('folders ')) {
                // this is loading a program
                var programToLoad = commandToProcess.toLowerCase().substring('folders '.length);
                cmdWindow.loadProgram(programToLoad);
            }
        }
        else {
            this.userTypedContent.innerText += content;
        }

        // scroll to bottom, to show newly added text
        this.wininner.scrollTo(0, this.wininner.scrollHeight);
    }

    cmdWindow.loadProgram = function(programName) {
        cmdWindow.println("Loading program " + programName + "...", true);
        fileName = programName.replace(/\s/g, '');
        sourceWindow.getProgram(programName, "programs/" + fileName + ".json");
        cmdWindow.println("",false);
    }

    // this "system print," all print proceeding the command currently being entered
    cmdWindow.println = function(content, suppressPrompt) {
        this.textContent.appendChild(document.createTextNode(content));
        this.textContent.appendChild(document.createElement("br"));
        if (!suppressPrompt) {
            this.textContent.appendChild(document.createTextNode(this.currentPath + "> "));
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
        this.println("Type 'folders [path]' to run folders on that path", true);

        this.println("");
    }

    return cmdWindow;
}

// typing (for when we're in the command window)
function keyevents(e) {
    if (cmdWindow.active) {
        var code = e.keyCode || e.which;
        cmdWindow.userprint(String.fromCharCode(code));
        e.preventDefault();
        return false;
    }

    if (e.keyCode == 8) return false;

    return true;
}

document.onkeypress = keyevents;
document.onkeydown = keyevents;