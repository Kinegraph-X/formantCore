/**
 * Tupple Streams
 */

var CoreTypes = require('src/core/CoreTypes');

var chroma = require('src/functionals/chroma');







var ScaleSolver = function(values) {
	var result;
	var potentialScales = [
		'0_1',
		'0_100',
		'0_255'
	];
	
	if (values[1] > 1) {
		potentialScales.shift();
		if (result = shouldReturn()) 
			return result;
	}
	
	if (values[1] > 255) {
		potentialScales.pop();
	}
	
	
}
ScaleSolver.prototype = Object.create(Object.prototype);

ScaleSolver.prototype.shouldReturn = function() {
	if (potentialScales.length === 1) {
		return potentialScales[0];
	}
}









var LinearScaleStream = function(name, value) {
	
	this.transform = this.computeScale();
	
	CoreTypes.Stream.call(this, name, value);
}
LinearScaleStream.prototype = Object.create(CoreTypes.Stream.prototype);
LinearScaleStream.prototype.objectType = 'LinearScaleStream';

LinearScaleStream.prototype.getScale = function() {
	return chroma.scale([this._value[0], this._value[1]]);
}

























module.exports = {
	LinearScaleStream : LinearScaleStream
}
