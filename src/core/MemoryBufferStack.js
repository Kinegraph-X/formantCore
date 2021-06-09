/**
 * constructor MemoryBufferStack
 */

var TypeManager = require('src/core/TypeManager');
var CSSSelector = require('src/_LayoutEngine/CSSSelector');
var _functionalStyleHelpers = require('src/core/_functionalStyleHelpers');


var MemoryBufferStack = function(itemSize, itemCount, isAbsoluteSize) {
	this.objectType = 'MemoryBufferStack';
	
	this.itemSize = itemSize;
	this._byteLength = 0;
	this._buffer = new Uint8Array(itemSize * itemCount);
	this.occupancy = new Uint8Array(itemCount / 8);
	
	this.traverseAndJumpFunction = this.setLogicForTraverseAndJump();
	this.branchlessLoop = this.getBranchlessLoop();
	
//	this.bytePointer = 0;
}

MemoryBufferStack.prototype = Object.create(Uint8Array.prototype);
MemoryBufferStack.prototype.objectType = 'MemoryBufferStack';

MemoryBufferStack.eightBitsMasks = [
	0x01,
	0x02,
	0x04,
	0x08,
	0x10,
	0x20,
	0x40,
	0x80
]

MemoryBufferStack.prototype.setLogicForTraverseAndJump = function() {
	var self = this;
	var getBuffer = this.getBuffer;
	var bufferCount = this._byteLength / this.itemSize;
	var jumperHost = new this.JumperHost();
	var occupancySolver = new this.OccupancySolver(this.occupancy, this.itemSize);
	
	var doArrayMin = new this.DoArrayMinFunction();
	var shouldJump = function(bufferIdx) {
//		console.log((jumperHost.jumper + bufferIdx) < bufferCount);
		return (jumperHost.jumper + bufferIdx) < bufferCount
			&& !doArrayMin.do(jumperHost.jumper, occupancySolver.getOccupancyFromBufferIdx(bufferIdx))
			&& !!++jumperHost.jumper;
	};
	
	var shouldRecurse = function(bufferIdx) {
		return jumpDecisionBranches[+(shouldJump(bufferIdx))];
	};
	
	var jumpDecisionBranches = new this.BranchesAsArray(shouldRecurse);
	
	return function(bufferIdx) {
		jumperHost.reset();
		shouldRecurse(bufferIdx)(bufferIdx);
		
		return jumperHost.jumper;
	};
}

MemoryBufferStack.prototype.getBranchlessLoop = function() {

	var branchlessLoop = function(callback, startBufferIdx, endBufferIdx) {
//		console.log(stasrtBufferIdx);
		if (startBufferIdx >= endBufferIdx)
			return;
		
		callback(this._buffer, startBufferIdx * this.itemSize);
		startBufferIdx += this.traverseAndJumpFunction(startBufferIdx);
		branchlessLoop(callback, startBufferIdx, endBufferIdx);
//		console.log(startBufferIdx);
	}.bind(this);
	
	return branchlessLoop;
}

MemoryBufferStack.prototype.getOffsetForBuffer = function(bufferIndex) {

	return bufferIndex * this.itemSize;
}

MemoryBufferStack.prototype.getBuffer = function(bufferIndex) {
//	return this._buffer;
	return new Uint8Array(this._buffer.buffer, bufferIndex * this.itemSize, this.itemSize);
}

MemoryBufferStack.prototype.set = function(val, offset) {
	// offsets for occupancy map
	var onAlignementOffset = offset % 8;
	var startOffset = offset - onAlignementOffset;
	
	if (this._buffer.byteLength >= offset) {
		console.warn('MemoryBufferStack', 'Setting a value at an offset longer than the buffer.', val, idx, ' Returning...');
		return;
	}
	else if (this._buffer.byteLength <= offset)
		this._buffer.buffer.append(new ArrayBuffer(this.itemSize));
	
	this._byteLength = this._buffer.byteLength;
	this._buffer.set(val, offset);
	this.occupancy.set(this.occupancy[Math.floor(startOffset / 8)] | MemoryBufferStack.eightBitsMasks[onAlignementOffset]);
}

MemoryBufferStack.prototype.setFromIndex = function(val, idx) {
	// offsets for occupancy map
	var offset = this.itemSize * idx;
	var onAlignementOffset = offset % 8;
	var startOffset = offset - onAlignementOffset;
	
	if (this._buffer.byteLength >= offset) {
		console.warn('MemoryBufferStack', 'Setting a value at an offset longer than the buffer.', val, idx, ' Returning...');
		return;
	}
	else if (this._buffer.byteLength === offset)
		this._buffer.buffer.append(new ArrayBuffer(this.itemSize));
	
	this._byteLength = this._buffer.byteLength;
	this._buffer.set(val, offset);
	this.occupancy.set(this.occupancy[Math.floor(startOffset / 8)] | MemoryBufferStack.eightBitsMasks[onAlignementOffset]);
}

MemoryBufferStack.prototype.invalidate = function(offset) {
	// offsets for occupancy map
	var onAlignementOffset = offset % 8;
	var startOffset = offset - onAlignementOffset;
	
	this.occupancy.set(this.occupancy[Math.floor(startOffset / 8)] & ~MemoryBufferStack.eightBitsMasks[onAlignementOffset]);
}

MemoryBufferStack.prototype.invalidateFromIndex = function(idx) {
	// offsets for occupancy map
	var offset = this.itemSize * idx;
	var onAlignementOffset = offset % 8;
	var startOffset = offset - onAlignementOffset;
	
	this.occupancy.set(this.occupancy[Math.floor(startOffset / 8)] & ~MemoryBufferStack.eightBitsMasks[onAlignementOffset]);
}

/**
 * @function MemoryBufferStack.prototype.append
 * 
 * @param editing val
 */
MemoryBufferStack.prototype.append = function(val) {

	if  (!val._byteLength)
		return;
	
	// offsets for occupancy map
	var offset = this._byteLength;
	
	if (this._byteLength + val._byteLength > this._buffer.byteLength) {
		this._buffer = new Uint8Array(this._buffer.buffer.append(new ArrayBuffer(val._byteLength)));
		this.occupancy = new Uint8Array(this.occupancy.buffer.append(new ArrayBuffer(Math.ceil((val._byteLength) / (this.itemSize * 8)))));
	}
	
	this._buffer.set(val._buffer, this._byteLength);	
	this._byteLength += val._byteLength;
	
	var occupancyValues = [], initialBufferIdx = offset / this.itemSize, occupancyPointer, currentOccupancyPointer;
	for (let bufferIdx = offset / this.itemSize, max = this._byteLength / this.itemSize; bufferIdx < max; bufferIdx++) {
//		console.log(bufferIdx, bufferIdx % 8, Math.floor((bufferIdx - initialBufferIdx) / 8));
		occupancyPointer = Math.floor((bufferIdx - initialBufferIdx) / 8);
		currentOccupancyPointer = Math.floor(bufferIdx / 8);
		occupancyValues[occupancyPointer] = this.occupancy[currentOccupancyPointer] | MemoryBufferStack.eightBitsMasks[ bufferIdx % 8 ];
	}
	
//	console.log(occupancyValues, Math.floor((offset / this.itemSize) / 8));
	this.occupancy.set(occupancyValues, Math.floor((offset / this.itemSize) / 8));
	
}

//MemoryBufferStack.prototype.getExpAsFunc = function(exp) {
//	console.log("exp : ' + exp + '", ' + 'curriedFunction, inParam' + ', ' + exp + '); 
//	return new Function('doRecurseFunction', 'inParam', 'return ' + exp + ';');
//}












MemoryBufferStack.prototype.BranchesAsArray = function(ifCallClause) {
	return [
		_functionalStyleHelpers.noOp,
		ifCallClause
	];
}
MemoryBufferStack.prototype.BranchesAsArray.prototype = {};






MemoryBufferStack.prototype.JumperHost = function() {
	this.jumper = 1;
	
}
MemoryBufferStack.prototype.JumperHost.prototype.reset = function() {
	this.jumper = 1;
}



MemoryBufferStack.prototype.OccupancySolver = function(occupancyBuffer, itemSize) {
	this._buffer = occupancyBuffer;
	this._itemSize = itemSize;
}
MemoryBufferStack.prototype.OccupancySolver.prototype.getOccupancyFromBufferIdx = function(bufferIdx) {
	var bitFieldOffset = bufferIdx % 8;
// 	console.log((this._buffer[Math.floor(bufferIdx / 8)] & MemoryBufferStack.eightBitsMasks[bitFieldOffset]) >> bitFieldOffset);
	return (this._buffer[Math.floor(bufferIdx / 8)] & MemoryBufferStack.eightBitsMasks[bitFieldOffset]) >> bitFieldOffset;
}
MemoryBufferStack.prototype.OccupancySolver.prototype.getOccupancyFromAbsoluteIdx = function(absoluteIdx) {
	var bitFieldOffset = (absoluteIdx / this.itemSize) % 8;
	return (this._buffer[Math.floor((absoluteIdx / this.itemSize) / 8)] & MemoryBufferStack.eightBitsMasks[bitFieldOffset]) >> bitFieldOffset;
}




MemoryBufferStack.prototype.arrayMin = function(arr) {
	return Math.min.apply(arr);
}

MemoryBufferStack.prototype.DoArrayMinFunction = function() {
	// Let's see that as a hint for the optimizer: capture a unique instance of the arrayMin func in the closure
	this.arrMin = arrayMin.bind(null);
	this.cachedArr = [];
}
MemoryBufferStack.prototype.DoArrayMinFunction.prototype.do = function(val0, val1) {
	this.cachedArr[0] = val0;
	this.cachedArr[1] = val1;
	return this.arrMin(this.cachedArr);
}






module.exports = MemoryBufferStack;