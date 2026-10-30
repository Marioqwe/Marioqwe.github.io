function HTMLActuator() {
    this.tileContainer              = document.querySelector(".tile-container");
    this.currentMovesScoreContainer = document.querySelector(".moves-score");
    this.currentLevelScoreContainer = document.querySelector(".level-score");
    this.alertMessageContainer      = document.querySelector(".alert-message");
    this.messageContainer           = document.querySelector(".game-message");

    this.alertMessageContainerID    = document.querySelector("#pageMessages");

    this.currentMovesScore = 0;
    this.currentLevelScore = 0;
    this.currentAlertMessage = " ";
    
    this.previousAlertSeverity = " ";
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
        //self.updateAlertMessage(metadata.alertMessage);

        if (metadata.alertObject != null) {
            self.createAlert(metadata.alertObject.details, metadata.alertObject.severity);
            self.previousAlertSeverity = metadata.alertObject.severity;
        }

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

HTMLActuator.prototype.updateAlertMessage = function (message) {
    this.clearContainer(this.alertMessageContainer);
    
    this.currentAlertMessage = message;
    this.alertMessageContainer.textContent = this.currentAlertMessage;
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

HTMLActuator.prototype.createAlert = function (details, severity) {

    console.log(this.previousAlertSeverity);

    this.clearContainer(this.alertMessageContainerID);

    var alertClasses = ["alert"];

    if (this.previousAlertSeverity == severity) {
        if (severity != "info") {
            alertClasses.push("animated");
            alertClasses.push("flipInX");
        }
    } else {
        alertClasses.push("animated");
        alertClasses.push("flipInX");
    }

    alertClasses.push("alert-" + severity.toLowerCase());

    //alertClasses.push("alert-dismissible");

    var msgWrapper = document.createElement("div");
    this.applyClasses(msgWrapper, alertClasses);

    if (details) {
        var msgDetailsWrapper = document.createElement("p");
        msgDetailsWrapper.textContent = details;
        msgWrapper.appendChild(msgDetailsWrapper);
    }

    /*
    var msgCloseWrapper = document.createElement("span");
    msgCloseWrapper.setAttribute("class", "close");
    msgCloseWrapper.setAttribute("data-dismiss", "alert");

    var msgCloseWrapperChild = document.createElement("i");
    msgCloseWrapperChild.setAttribute("class", "fa fa-times-circle");
    msgCloseWrapper.appendChild(msgCloseWrapperChild);

    msgWrapper.appendChild(msgCloseWrapper);
    */

    this.alertMessageContainerID.insertBefore(msgWrapper, this.alertMessageContainerID.firstChild);
};