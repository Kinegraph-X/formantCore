/**
 * @factory UIDGenerator
 * 
 */

/** @typedef {string & { __brand: "TemplateUID" }} TemplateUID */

const Generator = function() {
	this.nextUID = 0;
}

/** @returns {string} */
Generator.prototype.newUID = function() {
	return (this.nextUID++).toString();
}




const GeneratorForStyles = function() {
	this.nextUID = 0;
}
/** @returns {string} */
GeneratorForStyles.prototype.newUID = function() {
	return 'Style_' + (this.nextUID++).toString();
}



const GeneratorForDef = function() {
	this.nextUID = 0;
}
/** @returns {string} */
GeneratorForDef.prototype.newUID = function() {
	return 'Def_' + (this.nextUID++).toString();
}


const GeneratorForTemplates = function() {
	this.nextUID = 0;
}
/** @returns {string} */
GeneratorForTemplates.prototype.newUID = function() {
	return 'Def_' + (this.nextUID++).toString();
}



const GeneratorForViews = function() {
	this.nextUID = 0;
}
/** @returns {string} */
GeneratorForViews.prototype.newUID = function() {
	return 'Def_' + (this.nextUID++).toString();
}



const GeneratorForLists = function() {
	this.nextUID = 0;
}
/** @returns {string} */
GeneratorForLists.prototype.newUID = function() {
	return 'Def_' + (this.nextUID++).toString();
}




const GeneratorForLayoutNodes = function() {
	this.nextUID = 0;
}
/** @returns {string} */
GeneratorForLayoutNodes.prototype.newUID = function() {
	return (this.nextUID++).toString();
}

GeneratorForLayoutNodes.prototype.resetCursor = function() {
	this.nextUID = 0;
}



const GeneratorForTweens = function() {
	this.nextUID = 0;
}
/** @returns {string} */
GeneratorForTweens.prototype.newUID = function() {
	return (this.nextUID++).toString();
}

GeneratorForTweens.prototype.resetCursor = function() {
	this.nextUID = 0;
}




const GeneratorFor16bitsInt = function() {
	this.nextUID = 0;
}
/** @returns {number[]} */
GeneratorFor16bitsInt.prototype.newUID = function() {
	return [++this.nextUID & 0x00FF, (this.nextUID & 0x0000FF00) >> 8] ;
}

/** @param {number} num */
GeneratorFor16bitsInt.prototype.intFromNumber = function(num) {
	return [num & 0x00FF, (num & 0x0000FF00) >> 8] ;
}

/** @param {[number, number]} int16AsArray */
GeneratorFor16bitsInt.prototype.numberFromInt = function(int16AsArray) {
	return int16AsArray[0] | (int16AsArray[1] << 8) ;
}




export default {
	UIDGenerator : new Generator(),
	styleUIDGenerator : new GeneratorForStyles(),
	defUIDGenerator : new GeneratorForDef(),
	templateUIDGenerator : new GeneratorForTemplates(),
	viewUIDGenerator : new GeneratorForViews(),
	listUIDGenerator : new GeneratorForLists(),
	nodeUIDGenerator : new GeneratorForLayoutNodes(),
	tweenUIDGenerator : GeneratorForTweens,
	generatorFor16bitsInt : new GeneratorFor16bitsInt()
}