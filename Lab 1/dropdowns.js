/* 
Function Definitions for the menu options.
1. Display Dropdowns 
2. Toggle Button Functionality - Vertical/Horizontal Chart
3. Radio Button Functionality - X/Y Axis
*/

// Display Chart - Horizontal
function horizontalPlot() {
    clearSVG();
    chooseHorPlot(plotVar);
}

// Display Chart - Vertical
function verticalPlot() {
    clearSVG();
    choosePlot(plotVar);
}


// Display Attributes to Plot
function plotFunction() {
    var plotDropdown = document.createElement('div');
    plotDropdown.className = 'dropdown';
    plotDropdown.id = 'plotOpts';
    plotDropdown.innerHTML = 
        '<div class="dropdown-content">' +
        '<div class="menu-item-1" onclick="plotItemFunction(\'1\')">Artist</div>' +
        '<div class="menu-item-1" onclick="plotItemFunction(\'2\')">Song Duration</div>' +
        '<div class="menu-item-1" onclick="plotItemFunction(\'3\')">Explicit Content</div>' +
        '<div class="menu-item-1" onclick="plotItemFunction(\'4\')">Year</div>' +
        '<div class="menu-item-1" onclick="plotItemFunction(\'5\')">Popularity</div>' +
        '<div class="menu-item-1" onclick="plotItemFunction(\'6\')">Danceability</div>' +
        '<div class="menu-item-1" onclick="plotItemFunction(\'7\')">Energy</div>' +
        '<div class="menu-item-1" onclick="plotItemFunction(\'8\')">Key</div>' +
        '<div class="menu-item-1" onclick="plotItemFunction(\'9\')">Loudness</div>' +
        '<div class="menu-item-1" onclick="plotItemFunction(\'10\')">Mode</div>' +
        '<div class="menu-item-1" onclick="plotItemFunction(\'11\')">Speechiness</div>' +
        '<div class="menu-item-1" onclick="plotItemFunction(\'12\')">Acousticness</div>' +
        '<div class="menu-item-1" onclick="plotItemFunction(\'13\')">Instrumentalness</div>' +
        '<div class="menu-item-1" onclick="plotItemFunction(\'14\')">Liveness</div>' +
        '<div class="menu-item-1" onclick="plotItemFunction(\'15\')">Valence</div>' +
        '<div class="menu-item-1" onclick="plotItemFunction(\'16\')">Tempo</div>' +
        '<div class="menu-item-1" onclick="plotItemFunction(\'17\')">Genre</div>' +
        '</div>';

    document.getElementById('menu').appendChild(plotDropdown);
}


// Display Attributes to Choose
function assign() {
    var vals = document.createElement('div');
    vals.className = 'dropdown';
    vals.id = 'Vals';
    vals.innerHTML = 
        '<div class="dropdown-content">' +
        '<div class="menu-item-1" onclick="assignVariable(\'1\')">Artist</div>' +
        '<div class="menu-item-1" onclick="assignVariable(\'2\')">Song Duration</div>' +
        '<div class="menu-item-1" onclick="assignVariable(\'3\')">Explicit Content</div>' +
        '<div class="menu-item-1" onclick="assignVariable(\'4\')">Year</div>' +
        '<div class="menu-item-1" onclick="assignVariable(\'5\')">Popularity</div>' +
        '<div class="menu-item-1" onclick="assignVariable(\'6\')">Danceability</div>' +
        '<div class="menu-item-1" onclick="assignVariable(\'7\')">Energy</div>' +
        '<div class="menu-item-1" onclick="assignVariable(\'8\')">Key</div>' +
        '<div class="menu-item-1" onclick="assignVariable(\'9\')">Loudness</div>' +
        '<div class="menu-item-1" onclick="assignVariable(\'10\')">Mode</div>' +
        '<div class="menu-item-1" onclick="assignVariable(\'11\')">Speechiness</div>' +
        '<div class="menu-item-1" onclick="assignVariable(\'12\')">Acousticness</div>' +
        '<div class="menu-item-1" onclick="assignVariable(\'13\')">Instrumentalness</div>' +
        '<div class="menu-item-1" onclick="assignVariable(\'14\')">Liveness</div>' +
        '<div class="menu-item-1" onclick="assignVariable(\'15\')">Valence</div>' +
        '<div class="menu-item-1" onclick="assignVariable(\'16\')">Tempo</div>' +
        '<div class="menu-item-1" onclick="assignVariable(\'17\')">Genre</div>' +
        '</div>';

    document.getElementById('menu').appendChild(vals);
}


// Remove Chart in Display
function clearSVG() {
    var temp = document.getElementById('graph-canvas');
    while (temp.firstChild) {
        temp.removeChild(temp.firstChild);
    }
}


// Choose Bar Chart or Histogram - Vertical Plot
function choosePlot(value) {
    if (categorical.includes(value)) {
        barSVG(value);
    }
    else {
        histSVG(value);
    }
}


// Choose Bar Chart or Histogram - Horizontal Plot
function chooseHorPlot(value) {
    if (categorical.includes(value)) {
        barHorSVG(value);
    }
    else {
        histHorSVG(value);
    }
}


// Plot Selected Attribute
function plotItemFunction(item) {
    document.getElementById('plotOpts').remove();
    clearSVG();
    let value = parseInt(item);
    plotVar = value;
    choosePlot(value); // Default - Vertical Chart
}

// Assign Attribute to X or Y axis based on Radio Selection
function assignVariable(item) {
    var axes = document.getElementsByName('axis');
    if (axes[0].checked) {
        X = parseInt(item);
        // console.log('value x: ', X);
    }
    else {
        Y = parseInt(item);
        // console.log('value y: ', Y);
    }
    document.getElementById('Vals').remove();
}

// Call Scatter Plot Function
function scatterFunction() {
    // console.log('value x: ', X);
    // console.log('value y: ', Y);
    clearSVG();
    scatterSVG(X, Y);
}