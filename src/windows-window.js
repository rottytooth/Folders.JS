
/*
 * A Windows-style window (winwin)
 * Base class for Windows explorer and for command window
 */
function winwin(name, top, left) {

    // these are pretty much constants, we don't expect the windows to move once they're set up
    this.name = name;
    this.top = top; // 0 or 1
    this.left = left; // 0 or 1
    
    // holder for all four windows
    winwin.allTheWindows = [];

    this.active = false; // whether it's the currently active window

    this.makeActive = function() {}
    this.makeInactive = function() {}

    winwin.allTheWindows.push(this);

    // the window itself and its outer frame
    this.winframe = document.createElement("div");
    this.winframe.id = name;

    // add window to main div
    var main = document.getElementById("main");
    main.appendChild(this.winframe);

    this.winframe.classList.add("window_frame");

    this.headerPane = document.createElement("div");
    this.headerPane.classList.add("header_text");
    this.winframe.appendChild(this.headerPane);

    // this is the content portion of the window
    this.wininner = document.createElement("div");
    this.wininner.id = name + "_inner";
    this.winframe.appendChild(this.wininner);

    // all sizing information here
    this.redraw = () => {

        // that.active = active;
        if (this.active == 0) this.winframe.classList.add("inactive");

        // one quarter of browser space
        this.width = window.innerWidth / 2 - 17; 
        this.height = window.innerHeight / 2 - 17;

        this.winframe.style.width = this.width + "px";
        this.winframe.style.height = this.height + "px";
    
        // place it in one corner of the screen
        this.winframe.style.top = this.top * (this.height + 11) + "px";
        this.winframe.style.left = this.left * (this.width + 11) + "px";

        this.wininner.style.width = this.width - 14 + "px";
        this.wininner.style.height = this.height - 8 - 30 + "px";
    }

    // when clicking in the window, make it active and make all the other inactive
    var activeWinframe = this.winframe;
    this.winframe.onclick = () => {           
        document.body.click(); // call document's first, to clear all

        this.active = true;
        this.makeActive();
        activeWinframe.classList.remove("inactive");

        event.stopPropagation(); // don't call document's again
    };    

}

document.body.onclick = () => {            
    windowframes = main.querySelectorAll("div.window_frame"); 
    Object.entries(windowframes).map((object) => { 
        // needs [1] because the zero is the index from querySelecterAll()
        if (!object[1].classList.contains("inactive"))
            object[1].classList.add("inactive");
    });

    winwin.allTheWindows.forEach(function(win, idx) {
        document.getElementById(win.name).classList.add("inactive");
        win.makeInactive();
        win.active = false;
    });
}
