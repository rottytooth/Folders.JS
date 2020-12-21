
/*
 * A Windows explorer (a kind of winwin)
 */
function createExplorer(name, top, left, title) {

    var explorer = new winwin(name, top, left);
    explorer.title = title;

    explorer.draw = function(active) {
        this.redraw(active); // BASE

        this.headerPane.innerText = this.title;
        
        // add windows-explorer specific styles
        this.wininner.classList.add("explorer_inner");
        this.winframe.classList.add("explorer_frame");

        // left part of the window (the navigation pane)
        var navigationPane = document.createElement("div");
        this.wininner.appendChild(navigationPane);
        navigationPane.classList.add("navigationPane");
        navigationPane.style.height = this.height - 70 + "px";

        var navList = document.createElement("ul");
        navList.classList.add("navList");
        navigationPane.appendChild(navList);

        var contentPane = document.createElement("div");
        this.wininner.appendChild(contentPane);
        contentPane.classList.add("contentPane");
        contentPane.style.height = this.height - 70 + "px";
        this.contentPane = contentPane; // make available outside

        var footerPane = document.createElement("div");
        this.wininner.appendChild(footerPane);
        footerPane.classList.add("footerPane");
        this.footerPane = footerPane;

        if (explorer.folders !== []) {
            explorer.drawFolders(explorer.folders, navList);
        }

        // context menu -- FIXME: this doesn't seem to work!
        fldrs = main.querySelectorAll("div.fldr"); 
        Object.entries(fldrs).map((object) => { 
            object.onContextMenu = function(e) {
                e.preventDefault();
                return false;
            }
        });
    }

    // this is the set of folders that will be drawn for this particular explorer window
    // it is essentially the current data for that window
    explorer.folders = [];

    explorer.fldrclick = (e) => {

        var caller = e.target || e.srcElement;
        var cl = caller; // clear any selected from the rest of the list

        var fldrwin = document.getElementById(explorer.name);
        fldrwin.querySelectorAll("li").forEach(el => el.classList.remove("selected"));
        caller.classList.add("selected");
    }

    // based on the current data, redraw the folders
    explorer.drawFolders = function(jlist, navList) {

        for (var i = 0; i < jlist.length; i++) {
            var name = "New Folder";
            if (i > 0) {
                name += " (" + (i + 1) + ")";
            }
            var fldr = document.createElement("li");
            fldr.classList.add("fldr");
            if (jlist[i].length > 0) {
                fldr.classList.add("menu-open")
            }
            var liimg = document.createElement("img");
            liimg.src = 'icons/folder_icon_small_halfsize.png';
            fldr.appendChild(liimg);
            fldr.appendChild(document.createTextNode(name));

            fldr.addEventListener("click", explorer.fldrclick);

            navList.appendChild(fldr);
    
            if (jlist[i].length > 0) {
                var newUl = document.createElement("ul");
                newUl.classList.add("indent");
                navList.appendChild(newUl);
                explorer.drawFolders(jlist[i], newUl);
            }

            // right pane
            var biggerFolder = document.createElement("div");
            biggerFolder.className = "rightFolder"
            var biggFlrImg = document.createElement("img");
            biggerFolder.appendChild(biggFlrImg);
            biggerFolder.appendChild(document.createElement('br'));
            biggFlrImg.src = "icons/folder_empty_medium.png";
            biggerFolder.append(document.createTextNode(name)); 
            this.contentPane.appendChild(biggerFolder);
        }    

        this.footerPane.innerText = "(" + jlist.length + " items)";
    }

    // loads program into that window (only used for the window holding a program)
    explorer.getProgram = (name, path) =>
    {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', path);
        xhr.onload = function() {
            if (xhr.status == 200) {
                explorer.folders = JSON.parse(xhr.responseText);
                explorer.drawFolders(explorer.folders, document.getElementById(explorer.name).querySelector('.navList'));
//                explorer.title = "Program Source: " + name;
                explorer.headerPane.innerText = "Program Source: " + name;
            } else {
                var error = xhr.responseText;
                console.log(error);
                if (error.includes("404")) {
                    error = "Could not find program " + path;
                }
                cmdWindow.println("Load program failed: " + error, true);
            }            
        }
        xhr.send();
        
    }    

    return explorer;
}
