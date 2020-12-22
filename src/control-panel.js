function LoadProgram() {
    var programToLoad = document.getElementById("programLoad").value;
    cmdWindow.loadProgram(programToLoad);
}

function RunProgram() {
    folders.interpret(sourceWindow.folders);

    folders.runtime.begin(folders.root);
}
