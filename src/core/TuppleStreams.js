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












/**
 * 
 */
var TuppleStream = function(name, value) {
	CoreTypes.Stream.call(this, name, value);
}
TuppleStream.prototype = Object.create(CoreTypes.Stream.prototype);
TuppleStream.prototype.objectType = 'TuppleStream';
TuppleStream.prototype.subscribe = function(handlerOrHost, prop, transform, inverseTransform) {
	var subscription = this.addSubscription(handlerOrHost, prop, inverseTransform);
	this.update();
	return subscription;
}
TuppleStream.prototype.computeScale = function(values) {
	return chroma.scale();
}









/**
 * 
 */
var SemiScaleUpStream = function(name, value) {
	
	TuppleStream.call(this, name, value);
	this.transform = this.computeScale;
}
SemiScaleUpStream.prototype = Object.create(TuppleStream.prototype);
SemiScaleUpStream.prototype.objectType = 'SemiScaleUpStream';

SemiScaleUpStream.prototype.computeScale = function(values) {
	if (!Array.isArray(values)) {
		console.warn('SemiScaleUpStream colorGetter Stream: not an Array');
		return;
	}
	return chroma.scale([chroma.scale(values)(0.5), values[1]]).mode('lch').correctLightness();
}

//SemiScaleUpStream.prototype.set = function(values) {
//	console.log('SemiScaleUpStream', this);
//	this.forward = true;
//}

/**
 * 
 */
var SemiScaleDownStream = function(name, value) {
	
	TuppleStream.call(this, name, value);
	this.transform = this.computeScale;
}
SemiScaleDownStream.prototype = Object.create(TuppleStream.prototype);
SemiScaleDownStream.prototype.objectType = 'SemiScaleDownStream';

SemiScaleDownStream.prototype.computeScale = function(values) {
	if (!Array.isArray(values)) {
		console.warn('SemiScaleDownStream colorGetter Stream: not an Array');
		return;
	}
	return chroma.scale([values[0], chroma.scale(values)(0.5)]).mode('lch').correctLightness();
}

/**
 * 
 */
var LinearScaleStream = function(name, value) {
	
	TuppleStream.call(this, name, value);
	this.transform = this.computeScale;
}
LinearScaleStream.prototype = Object.create(TuppleStream.prototype);
LinearScaleStream.prototype.objectType = 'LinearScaleStream';

LinearScaleStream.prototype.computeScale = function(values) {
	return chroma.scale([values[0], values[1]]).mode('lch').correctLightness();
}

/**
 * 
 */
var PowerScaleStream = function(name, value) {
	
	TuppleStream.call(this, name, value);
	this.transform = this.computeScale;
}
PowerScaleStream.prototype = Object.create(TuppleStream.prototype);
PowerScaleStream.prototype.objectType = 'PowerScaleStream';

PowerScaleStream.prototype.computeScale = function(values) {
	return chroma.scale([values[0], chroma.scale(values)(0.27), values[1]]).mode('lab');
}

/**
 * 
 */
var LogScaleStream = function(name, value) {
	
	TuppleStream.call(this, name, value);
	this.transform = this.computeScale;
}
LogScaleStream.prototype = Object.create(TuppleStream.prototype);
LogScaleStream.prototype.objectType = 'LogScaleStream';

LogScaleStream.prototype.computeScale = function(values) {
	return chroma.scale([values[0], chroma.scale(values)(0.77), values[1]]).mode('lch').correctLightness();
}

/**
 * 
 */
var BezierSmoothedScaleStream = function(name, value) {
	
	TuppleStream.call(this, name, value);
	this.transform = this.computeScale;
}
BezierSmoothedScaleStream.prototype = Object.create(TuppleStream.prototype);
BezierSmoothedScaleStream.prototype.objectType = 'BezierSmoothedScaleStream';

BezierSmoothedScaleStream.prototype.computeScale = function(values) {
	return chroma.bezier([values[0], values[1]]).scale().mode('lch');
}

/**
 * 
 */
var ConstantLuminanceScaleStream = function(name, value) {
	
	TuppleStream.call(this, name, value);
	this.transform = this.computeScale;
}
ConstantLuminanceScaleStream.prototype = Object.create(TuppleStream.prototype);
ConstantLuminanceScaleStream.prototype.objectType = 'ConstantLuminanceScaleStream';

ConstantLuminanceScaleStream.prototype.computeScale = function(values) {
	return chroma.scale([values[0], values[1]]).correctLightness();
}


/**
 * 
 */
var ThreePointsScaleStream = function(name, value) {
	
	TuppleStream.call(this, name, value);
	this.transform = this.computeScale;
}
ThreePointsScaleStream.prototype = Object.create(TuppleStream.prototype);
ThreePointsScaleStream.prototype.objectType = 'ThreePointsScaleStream';

ThreePointsScaleStream.prototype.computeScale = function(values) {
	return chroma.scale([values[0], '#999999', chroma(values[1]).brighten(1.77)]).domain([0, 0.61, 1]);
}


























module.exports = {
	SemiScaleUpStream : SemiScaleUpStream,
	SemiScaleDownStream : SemiScaleDownStream,
	LinearScaleStream : LinearScaleStream,
	PowerScaleStream : PowerScaleStream,
	LogScaleStream : LogScaleStream,
	BezierSmoothedScaleStream : BezierSmoothedScaleStream,
	ConstantLuminanceScaleStream : ConstantLuminanceScaleStream,
	ThreePointsScaleStream : ThreePointsScaleStream
}
