function Grid(size, previousState) {
    this.size = size;
    this.cells = previousState ? this.fromState(previousState) : this.empty();
}

Grid.prototype.empty = function () {
    var cells = [];

    for (var x = 0; x < this.size; x++) {
        var row = cells[x] = [];
        
        for (var y = 0; y < this.size; y++) {
            row.push(null);
        }
    }
    
    return cells;
};

Grid.prototype.fromState = function (state) {
    var cells = [];

    for (var x = 0; x < this.size; x++) {
        var row = cells[x] = [];

        for (var y = 0; y < this.size; y++) {
            var tile = state[x][y];
            row.push(tile ? new Tile(tile.position, tile.value) : null);
        }
    }

    return cells;
};

Grid.prototype.insertTile = function (tile) {
    this.cells[tile.x][tile.y] = tile;
};

Grid.prototype.tileAtPosition = function (position) {
    return this.cells[position.x][position.y];
};

Grid.prototype.resetTilesSelectedState = function () {
    for (var x = 0; x < this.size; x++) {
        for (var y = 0; y < this.size; y++) {
            this.cells[x][y].selected = false;
        }
    }
};

Grid.prototype.serialize = function () {
    var cellState = [];

    for (var x = 0; x < this.size; x++) {
        var row = cellState[x] = [];

        for (var y = 0; y < this.size; y++) {
            row.push(this.cells[x][y] ? this.cells[x][y].serialize() : null);
        }
    }

    return {
        size: this.size,
        cells: cellState
    };
};