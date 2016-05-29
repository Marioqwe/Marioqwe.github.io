function GameManager(size, InputManager, Actuator, StorageManager) {
    this.size = size; // Size of the grid
    this.actuator = new Actuator;
    this.inputManager = new InputManager;
    this.storageManager = new StorageManager;
    
    this.inputManager.on("click", this.performClickAction.bind(this));
    this.inputManager.on("undo", this.undoAction.bind(this));
    this.inputManager.on("moveToNextLevel", this.moveToNextLevel.bind(this));
    this.inputManager.on("restart", this.restart.bind(this));

    this.firstSelected = false;
    this.firstPosition = null;

    this.storedValues = [];
    
    this.mergeErrorMessage = "";

    this.mergeErrorCounter = 0;
    
    this.setup();
}

GameManager.prototype.setup = function () {

    var previousState = this.storageManager.getGameState();

    // Reload the game from a previous game if present
    if (previousState) {
        this.grid        = new Grid(previousState.grid.size,
            previousState.grid.cells); // Reload grid
        this.moves       = previousState.moves;
        this.level       = previousState.level;
        this.won         = previousState.won;
        this.newTiles    = false;
        this.storedValues = previousState.storedValues;
        this.mergeErrorMessage = "Make all tiles equal to " + this.level;
    } else {
        this.grid = new Grid(this.size);
        this.moves = 0;
        this.level = 1;
        this.won = false;
        this.newTiles = false;
        this.mergeErrorMessage = "Make all tiles equal to " + this.level;

        this.addStartTiles();
    }
    
    
    this.actuate();
};

// Represent the current game as an object
GameManager.prototype.serialize = function () {
    return {
        grid:        this.grid.serialize(),
        moves:       this.moves,
        level:       this.level,
        won:         this.won,
        newTiles:    this.newTiles,
        storedValues:this.storedValues
    };
};

GameManager.prototype.addStartTiles = function () {
    for (var i=0; i < this.size; i++) {
        for (var j=0; j < this.size; j++) {

            if (i === 1 && j === 1) {
                this.addTile({ x: i, y: j}, 0);
            } else {
                this.addTile({ x: i, y: j}, 1)
            }
        }
    }
};

GameManager.prototype.addTile = function (position, value) {
    var tile = new Tile(position, value);
    this.grid.insertTile(tile);
};

GameManager.prototype.actuate = function () {

    this.storageManager.setGameState(this.serialize());
    
    this.actuator.actuate(this.grid, {
        moves: this.moves,
        level: this.level,
        won: this.won,
        newTiles: this.newTiles,
        inputManager: this.inputManager,
        mergeErrorMessage: this.mergeErrorMessage
    });

};

GameManager.prototype.performClickAction = function (position) {
    if (this.firstSelected === false) {
        this.firstSelected = true;
        this.firstPosition = position;
        this.grid.cells[position.x][position.y].selected = true;

        if (this.level < 4) {
            this.mergeErrorMessage = "You won't get past level 3.";
            if (this.moves > 10) {
                this.mergeErrorMessage = "Is it really taking you that many moves? I know you can do better ...";
            }

            if (this.moves > 16) {
                this.mergeErrorMessage = "Nope there won't be a reset level button.";
            }

            if (this.moves > 20) {
                this.mergeErrorMessage = "I think you should give up already. Go back to playing 2048.";
            }

        } else if (this.level == 4) {
            this.mergeErrorMessage = "I have to say I'm surprised you made it this far. Most people get stuck on level 3 and give up.";

            if (this.moves > 12) {
                this.mergeErrorMessage = "Is it really taking you that many moves? I know you can do better ...";
            }

            if (this.moves > 18) {
                this.mergeErrorMessage = "Nope there won't be a reset level button.";
            }

            if (this.moves > 22) {
                this.mergeErrorMessage = "I think you should give up already. Go back to playing 2048.";
            }
        } else if (this.level == 5) {
            this.mergeErrorMessage = "Keep up the good work. The surprise is around the corner.";

            if (this.moves > 14) {
                this.mergeErrorMessage = "Is it really taking you that many moves? I know you can do better ...";
            }

            if (this.moves > 20) {
                this.mergeErrorMessage = "Nope there won't be a reset level button.";
            }

            if (this.moves > 24) {
                this.mergeErrorMessage = "I think you should give up already. Go back to playing 2048.";
            }
        } else if (this.level == 6) {
            this.mergeErrorMessage = "I won't bother you anymore";

            if (this.moves > 16) {
                this.mergeErrorMessage = "Is it really taking you that many moves? I know you can do better ...";
            }

            if (this.moves > 22) {
                this.mergeErrorMessage = "Nope there won't be a reset level button.";
            }

            if (this.moves > 26) {
                this.mergeErrorMessage = "I think you should give up already. Go back to playing 2048.";
            }
        } else if (this.level >= 7) {
            this.mergeErrorMessage = "There's a leaderboard if you get the app!";
        }

    } else {
        this.firstSelected = false;

        if (this.equalPosition(this.firstPosition, position)) {
            // cannot combine tile with itself
            this.mergeErrorMessage = "You cannot merge a tile with itself! Read the \"HOW TO PLAY\" at the bottom of the page.";
            this.mergeErrorCounter = this.mergeErrorCounter + 1;

            console.log(this.mergeErrorMessage)
        } else {
            
            var firstTileOldValue = this.grid.tileAtPosition(this.firstPosition).value;
            var secondTileOldValue = this.grid.tileAtPosition(position).value;
            
            var firstTileNewValue = firstTileOldValue + 1;
            var secondTileNewValue = secondTileOldValue + firstTileOldValue;
            
            if ((firstTileNewValue > this.level) || (secondTileNewValue > this.level)) {
                // tiles cannot have value greater than level
                this.mergeErrorMessage = "The tiles cannot be greater than the current level! Read the \"HOW TO PLAY\" at the bottom of the page.";
                this.mergeErrorCounter = this.mergeErrorCounter + 1;
            } else {
                this.grid.tileAtPosition(position).setValue(secondTileNewValue);
                this.grid.tileAtPosition(this.firstPosition).setValue(firstTileNewValue);

                this.grid.tileAtPosition(position).merged = true;
                this.grid.tileAtPosition(this.firstPosition).merged = true;

                this.grid.tileAtPosition(position).saveOldValue(secondTileOldValue);
                this.grid.tileAtPosition(this.firstPosition).saveOldValue(firstTileOldValue);

                this.storedValues.push({
                    firstTile: {
                        position: this.firstPosition,
                        value: firstTileOldValue
                    },
                    secondTile: {
                        position: position,
                        value: secondTileOldValue
                    }
                });
                
                this.moves = this.moves + 1;
                this.mergeErrorMessage = "Make all tiles equal to " + this.level;
            }
        }
        
        this.grid.resetTilesSelectedState();
    }

    this.followUp();
};

GameManager.prototype.followUp = function () {
    if (this.userWon() === true) {
        // user has won
        if (this.level == 1) {
            this.mergeErrorMessage = "It doesn't get any easier than level 1.";
        } else if (this.level <= 3 && this.level > 1) {
            this.mergeErrorMessage = "You are doing good so far.";
        } else if (this.level == 4) {
            this.mergeErrorMessage = "I meant you won't get past level 4.";
        } else if (this.level == 5) {
            this.mergeErrorMessage = "You are good. There's a surprise if you get past level 7.";
        } else if (this.level == 6) {
            this.mergeErrorMessage = "You are almost there!";
        } else if (this.level == 7) {
            this.mergeErrorMessage = "I lied :P! You are good enough now. Get the app and compare your highest level to others in the leaderboard! Also share it with your friends on facebook and/or twitter to support me :).";
        } else if (this.level >= 8) {
            this.mergeErrorMessage = "Get the app and share it with your friends if you are enjoying the game! That's the best way you can support me ;). You'll also have access to the leaderboard!";
        }
    }

    this.actuate();
};

GameManager.prototype.equalPosition = function (first, second) {
    return first.x === second.x && first.y === second.y;
};

GameManager.prototype.userWon = function () {
    for (var x = 0; x < this.size; x++) {
        for (var y = 0; y < this.size; y++) {
            var tile = this.grid.cells[x][y];
            
            if (tile.value !== this.level) {
                this.won = false;
                return false;
            }
        }
    }
    
    this.won = true;
    return true;
};

GameManager.prototype.undoAction = function () {

    var length = this.storedValues.length;

    if (length > 0) {
        if (this.firstSelected == true) {
            this.firstSelected = false;
            this.grid.cells[this.firstPosition.x][this.firstPosition.y].selected = false;
        }

        var firstTile = this.storedValues[length - 1].firstTile;
        var secondTile = this.storedValues[length - 1].secondTile;

        var firstTileOldValue = this.grid.tileAtPosition(firstTile.position).value;
        var secondTileOldValue = this.grid.tileAtPosition(secondTile.position).value;

        this.grid.tileAtPosition(firstTile.position).saveOldValue(firstTileOldValue);
        this.grid.tileAtPosition(secondTile.position).saveOldValue(secondTileOldValue);

        this.grid.tileAtPosition(firstTile.position).setValue(firstTile.value);
        this.grid.tileAtPosition(secondTile.position).setValue(secondTile.value);

        this.grid.tileAtPosition(firstTile.position).merged = true;
        this.grid.tileAtPosition(secondTile.position).merged = true;

        this.moves = this.moves + 1;

        this.storedValues.pop();
    }

    this.mergeErrorMessage = "Make all tiles equal to " + this.level;
    this.mergeErrorCounter = 0;
    this.followUp();
};

GameManager.prototype.newGame = function(level) {
    this.won = false;

    this.moves = 0;
    this.level = level;

    this.mergeErrorMessage = "Make all tiles equal to " + this.level;
    this.mergeErrorCounter = 0;

    for (var x = 0; x < this.size; x++) {
        for (var y = 0; y < this.size; y++) {
            this.grid.cells[x][y].value = 1;

            if (x == 1 && y == 1) {
                this.grid.cells[x][y].value = 0;
            }
        }
    }

    this.newTiles = true;
    this.grid.resetTilesSelectedState();
    this.actuate();
    
    this.newTiles = false;
    this.storedValues.length = 0;
};

GameManager.prototype.restart = function () {

    this.storageManager.clearGameState();
    this.actuator.continueGame(); // clear the game won message
    this.newGame(1);
    this.grid.resetTilesSelectedState();
};

// Move to next level
GameManager.prototype.moveToNextLevel = function () {

    this.actuator.continueGame(); // Clear the game won message
    this.newGame(this.level + 1);
};