function HTMLActuator() {
    this.tileContainer              = document.querySelector(".tile-container");
    this.currentMovesScoreContainer = document.querySelector(".moves-score");
    this.currentLevelScoreContainer = document.querySelector(".level-score");
    this.messageContainer = document.querySelector(".game-message");

    this.currentMovesScore = 0;
    this.currentLevelScore = 0;
}

HTMLActuator.prototype.actuate = function (grid, metadata) {
    var self = this;

    window.requestAnimationFrame(function () {
        self.clearContainer(self.tileContainer);

        grid.cells.forEach(function (column) {
           column.forEach(function (cell) {
               if (cell) {
                   self.addTile(cell, metadata);
               }
           });
        });
        
        self.updateCurrentMovesScore(metadata.moves);
        self.updateCurrentLevelScore(metadata.level);
        
        if (metadata.won === true) {
            self.message();
        }
    });
};

// Continues the game (both restart and keep playing)
HTMLActuator.prototype.continueGame = function () {
    this.clearMessage();
};

HTMLActuator.prototype.clearContainer = function (container) {
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
};

HTMLActuator.prototype.addTile = function (tile, metadata) {
    var wrapper  = document.createElement("div");
    var inner    = document.createElement("div");
    var position = { x: tile.x, y: tile.y };
    var positionClass = this.positionClass(position);

    var classes = ["tile", "tile-" + tile.value, positionClass];

    this.applyClasses(wrapper, classes);

    inner.classList.add("tile-inner");
    inner.textContent = tile.value;
    
    wrapper.appendChild(inner);

    if (tile.merged === true) {
        tile.merged = false;
        classes.push("tile-merged");
        this.applyClasses(wrapper, classes);

        // Add tile effect
        var diff = tile.value - tile.oldValue;
        console.log(tile.value, tile.oldValue, tile.x, tile.y, diff, wrapper);
        var addition = document.createElement("div");
        addition.classList.add("tile-addition");
        
        if (diff >= 0) {
            addition.textContent = "+" + diff;
        } else {
            addition.textContent = "-" + Math.abs(diff);
        }
        
        wrapper.appendChild(addition);
    }
    
    if (tile.selected === true) {
        wrapper.style.opacity = 0.5;
    }

    if (metadata.newTiles === true) {
        classes.push("tile-new");
        this.applyClasses(wrapper, classes);
    }
    
    metadata.inputManager.listenToTile(wrapper, position);

    this.tileContainer.appendChild(wrapper);
};

HTMLActuator.prototype.applyClasses = function (element, classes) {
    element.setAttribute("class", classes.join(" "));
};

HTMLActuator.prototype.normalizePosition = function (position) {
    return { x: position.x + 1, y: position.y + 1 };
};

HTMLActuator.prototype.positionClass = function (position) {
    position = this.normalizePosition(position);
    return "tile-position-" + position.x + "-" + position.y;
};

HTMLActuator.prototype.updateCurrentMovesScore = function (score) {
    this.clearContainer(this.currentMovesScoreContainer);

    this.currentMovesScore = score;
    this.currentMovesScoreContainer.textContent = this.currentMovesScore;
};

HTMLActuator.prototype.updateCurrentLevelScore = function (score) {
    this.clearContainer(this.currentLevelScoreContainer);
    
    this.currentLevelScore = score;
    this.currentLevelScoreContainer.textContent = this.currentLevelScore;
};

HTMLActuator.prototype.message = function () {
    var type = "level-cleared";
    var message = "Level cleared!";
    
    this.messageContainer.classList.add(type);
    this.messageContainer.getElementsByTagName("p")[0].textContent = message;
};

HTMLActuator.prototype.clearMessage = function () {
    this.messageContainer.classList.remove("level-cleared");
};