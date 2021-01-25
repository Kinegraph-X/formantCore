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




module.exports =  {
	UIDGenerator : new Generator(),
	StyleUIDGenerator : new GeneratorForStyles(),
	DefUIDGenerator : new GeneratorForDefs()
}