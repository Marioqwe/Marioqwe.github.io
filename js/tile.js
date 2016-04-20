function Tile(position, value) {
    this.x = position.x;
    this.y = position.y;
    this.value = value;
    
    this.selected = false;
    
    this.oldValue = null;
    
    this.merged = false;
}

Tile.prototype.setValue = function (value) {
    this.value = value;
};

Tile.prototype.saveOldValue = function (value) {
    this.oldValue = value;
};