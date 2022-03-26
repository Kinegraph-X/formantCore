/**
 * @constructor MemoryMapBuffer
 */

var TypeManager = require('src/core/TypeManager');
var MemoryBufferStack= require('src/core/MemoryBufferStack');

var MemoryMapBuffer = function(itemSize, initialContent) {
	this.objectType = 'MemoryMapBuffer';
	
	var propsCount = this.propertiesStaticArray.length;
	this.propAddresses = (new Uint8Array(propsCount)).fill(255);
	this.itemSize = itemSize;
	this._buffer = new Uint8Array(propsCount * itemSize);
	
	this.traverseAndJumpFunction = this.setLogicForTraverseAndJump();
	this.branchlessLoop = this.getBranchlessLoop();
	
}
MemoryMapBuffer.prototype = Object.create(Uint8Array.prototype);
MemoryMapBuffer.prototype.objectType = 'MemoryMapBuffer';

MemoryMapBuffer.prototype.propertiesStaticArray= [];				// virtual
MemoryMapBuffer.prototype.propertiesAccessGroupsBoudaries = {};		// virtual

MemoryMapBuffer.prototype.setLogicForTraverseAndJump = MemoryBufferStack.prototype.setLogicForTraverseAndJump;
MemoryMapBuffer.prototype.getBranchlessLoop = MemoryBufferStack.prototype.getBranchlessLoop;
MemoryMapBuffer.prototype.BranchesAsArray = MemoryBufferStack.prototype.BranchesAsArray ;
MemoryMapBuffer.prototype.JumperHost = MemoryBufferStack.prototype.JumperHost;
MemoryMapBuffer.prototype.OccupancySolver = MemoryBufferStack.prototype.OccupancySolver;
MemoryMapBuffer.prototype.arrayMin = MemoryBufferStack.prototype.arrayMin;
MemoryMapBuffer.prototype.DoArrayMinFunction = MemoryBufferStack.prototype.DoArrayMinFunction;

//MemoryMapBuffer.prototype.get = function(propertyIdx) {
//	
//}
//
//MemoryMapBuffer.prototype.set = function(propertyIdx, propertyValue) {
//	
//}

MemoryMapBuffer.prototype.getProperty = function(propertyName) {
	
	if (typeof this.propertiesStaticMap[propertyName] === 'undefined') {
		console.warn('MemoryMapBuffer:get', 'The requested property ' + propertyName + 'is not implemented', 'Returning...');
		return;	
	}
		
	return this.occupancySolver(propertyName)
		&& this._buffer[this.propAddresses[this.propertiesStaticMap[propertyName]] * this.itemSize];
}

MemoryMapBuffer.prototype.setProperty = function(propertyName, propertyValue) {
	if (typeof this.propertiesStaticMap[propertyName] === 'undefined') {
		console.warn('MemoryMapBuffer:set', 'The requested property ' + propertyName + 'is not implemented', 'Returning...');
		return;	
	}
	
	if (this._byteLength >= 254) {
		console.error('CSSPropertyIdx in the MapBuffer would have been out of bounds.', 'Operation Cancelled...');
		return;
	}
	this.occupancySetter(propertyName, true);
	this._buffer[this.propAddresses[this.propertiesStaticMap[propertyName]] * this.itemSize] = propertyValue;
	
	this._byteLength += this.itemSize;
}

MemoryMapBuffer.prototype.occupancySolver = function(propertyName) {
	return this.propAddresses[this.propertiesStaticMap[propertyName]] !== 255;
}

MemoryMapBuffer.prototype.occupancySetter = function(propertyName, isSet) {
	this.propAddresses[this.propertiesStaticMap[propertyName]] = isSet ? this._byteLength : (this.unfragmentBuffer(1) && 255);
}

MemoryMapBuffer.prototype.unfragmentBuffer = function(removedCount) {
	// Loop over occupancy and collect all props that have an address smaller than (this._byteCount - removedCOunt)
	return true;	
}



 






module.exports = MemoryMapBuffer;