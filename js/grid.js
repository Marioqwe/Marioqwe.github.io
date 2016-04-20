function Grid(size) {
    this.size = size;
    this.cells = this.empty();
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