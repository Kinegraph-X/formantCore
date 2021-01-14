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
var TuppleStream = function(name, value, computeScale, lazy) {
	CoreTypes.Stream.call(this, name, value, null, computeScale, lazy);
	this.defaultScale = chroma.scale(['#000001', '#FFF']);
}
TuppleStream.prototype = Object.create(CoreTypes.Stream.prototype);
TuppleStream.prototype.objectType = 'TuppleStream';
TuppleStream.prototype.subscribe = function(handlerOrHost, prop, transform, inverseTransform) {
	var subscription = this.addSubscription(handlerOrHost, prop, inverseTransform);
	this.update();
	return subscription;
}
TuppleStream.prototype.hasValue = function() {
	if (!Array.isArray(this._value) && Object.prototype.toString.call(this._value) !== '[object Object]')
		return false;
	return true;
}
TuppleStream.prototype.computeScale = function(values) {
	return chroma.scale();
}
TuppleStream.prototype.getValues = function(count) {
	if (!this.hasValue)
		return [];
	count = count || 100;
	return this.get().colors(count).map(function(val) {
		return chroma(val).luminance();
	});
}
TuppleStream.prototype.getValuesReverse = function(count) {
	if (!this.hasValue)
		return [];
	count = count || 100;
	return this.get().colors(count).map(function(val) {
		return chroma(val).luminance();
	}).reverse();
}
TuppleStream.prototype.getColors = function(count) {
	if (!Array.isArray(this._value) && Object.prototype.toString.call(this._value) !== '[object Object]')
		return [];
		
	return this.get().colors(count);
}
TuppleStream.prototype.getColorsReverse = function(count) {
	if (!this.hasValue)
		return [];
	count = count || 100;
	return this.get().colors(count).reverse();
}









/**
 * 
 */
var SemiScaleUpStream = function(name, value, lazy) {
	
	TuppleStream.call(this, name, value, this.computeScale, lazy);
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
var SemiScaleDownStream = function(name, value, lazy) {
	
	TuppleStream.call(this, name, value, this.computeScale, lazy);
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
var LinearScaleStream = function(name, value, lazy) {
	
	TuppleStream.call(this, name, value, this.computeScale, lazy);
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
var PowerScaleStream = function(name, value, lazy) {
	
	TuppleStream.call(this, name, value, this.computeScale, lazy);
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
var LogScaleStream = function(name, value, lazy) {
	
	TuppleStream.call(this, name, value, this.computeScale, lazy);
	this.transform = this.computeScale;
}
LogScaleStream.prototype = Object.create(TuppleStream.prototype);
LogScaleStream.prototype.objectType = 'LogScaleStream';

LogScaleStream.prototype.computeScale = function(values) {
	return chroma.scale([values[0], chroma.scale(values)(0.3), chroma.scale(values)(0.6), values[1]]).mode('lch').domain([0, .12, .34, 1]);
}

/**
 * 
 */
var RealLogScaleStream = function(name, value, lazy) {
	
	TuppleStream.call(this, name, value, this.computeScale, lazy);
	this.transform = this.computeScale;
}
RealLogScaleStream.prototype = Object.create(TuppleStream.prototype);
RealLogScaleStream.prototype.objectType = 'RealLogScaleStream';

RealLogScaleStream.prototype.computeScale = function(values) {
	var _scale = chroma.scale(this.defaultScale).domain([0.001, 1]).colors(100).map(function(val) {
		return val > 0 ? chroma(val).luminance() : chroma(val).luminance() + 0.001;
	});
	
	return chroma.scale(values).domain(chroma.limits(_scale, 'l',  10));
}

/**
 * 
 */
var BezierSmoothedScaleStream = function(name, value, lazy) {
	
	TuppleStream.call(this, name, value, this.computeScale, lazy);
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
var ConstantLuminanceScaleStream = function(name, value, lazy) {
	
	TuppleStream.call(this, name, value, this.computeScale, lazy);
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
var ThreePointsScaleStream = function(name, value, lazy) {
	
	TuppleStream.call(this, name, value, this.computeScale, lazy);
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
	RealLogScaleStream : RealLogScaleStream,
	BezierSmoothedScaleStream : BezierSmoothedScaleStream,
	ConstantLuminanceScaleStream : ConstantLuminanceScaleStream,
	ThreePointsScaleStream : ThreePointsScaleStream
}
