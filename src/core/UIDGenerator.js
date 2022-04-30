/**
 * @factory UIDGenerator
 * 
 */

var Generator = function() {
	this.nextUID = 0;
}

Generator.prototype.newUID = function() {
	return (this.nextUID++).toString();
}




var GeneratorForStyles = function() {
	this.nextUID = 0;
}

GeneratorForStyles.prototype.newUID = function() {
	return 'Style_' + (this.nextUID++).toString();
}




var GeneratorForDefs = function() {
	this.nextUID = 0;
}

GeneratorForDefs.prototype.newUID = function() {
	return 'Def_' + (this.nextUID++).toString();
}




var GeneratorForLayoutNodes = function() {
	this.nextUID = 0;
}

GeneratorForLayoutNodes.prototype.newUID = function() {
	return (this.nextUID++).toString();
}

GeneratorForLayoutNodes.prototype.resetCursor = function() {
	this.nextUID = 0;
}




var GeneratorFor16bitsInt = function() {
	this.nextUID = 0;
}

GeneratorFor16bitsInt.prototype.newUID = function() {
	return [++this.nextUID & 0x00FF, this.nextUID >> 8] ;
}

GeneratorFor16bitsInt.prototype.intFromNumber = function(number) {
	return [number & 0x00FF, number >> 8] ;
}

GeneratorFor16bitsInt.prototype.numberFromInt = function(int16AsArray) {
	return int16AsArray[0] | (int16AsArray[1] << 8) ;
}




module.exports =  {
	UIDGenerator : new Generator(),
	StyleUIDGenerator : new GeneratorForStyles(),
	DefUIDGenerator : new GeneratorForDefs(),
	NodeUIDGenerator : new GeneratorForLayoutNodes(),
	GeneratorFor16bitsInt : new GeneratorFor16bitsInt()
}