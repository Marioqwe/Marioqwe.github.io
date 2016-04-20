function GameInputManager() {
    this.actions = {};
    this.size = 3;

    this.listen();
}

GameInputManager.prototype.on = function (action, callback) {
    if (!this.actions[action]) {
        this.actions[action] = [];
    }

    this.actions[action].push(callback);
};

GameInputManager.prototype.emit = function (action, position) {

    var callbacks = this.actions[action];

    if (callbacks) {
        callbacks.forEach( function (callback) {
            callback(position);
        });
    }
};

GameInputManager.prototype.listen = function () {

    // Respond to button presses
    this.bindButtonPress(".undo-button", this.undo);
    this.bindButtonPress(".next-level-button", this.moveToNextLevel);
};

GameInputManager.prototype.listenToTile = function (tileWrapper, position) {

    var self = this;
    
    tileWrapper.addEventListener("click", function (event) {
        event.preventDefault();
        self.emit("click", position);
    });
    
};

GameInputManager.prototype.undo = function (event) {
    event.preventDefault();
    this.emit("undo");
}

GameInputManager.prototype.moveToNextLevel = function (event) {
    event.preventDefault();
    this.emit("moveToNextLevel");
};

GameInputManager.prototype.bindButtonPress = function (selector, fn) {

    var self = this;

    var button = document.querySelector(selector);
    /*
    button.addEventListener("click", function (event) {
        self.undo(event);
    });
    */
    button.addEventListener("click", fn.bind(this));
};

