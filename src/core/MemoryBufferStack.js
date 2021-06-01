/**
 * constructor MemoryBufferStack
 */

var TypeManager = require('src/core/TypeManager');




var MemoryBufferStack = function(itemSize, itemCount, isAbsoluteSize) {
	this.objectType = 'MemoryBufferStack';
	
	this.itemSize = itemSize;
	this._byteLength = 0;
	this._buffer = new Uint8Array(itemSize * itemCount);
	this.occupancy = new Uint8Array(itemCount / 8);
	
	this.traverseAndJump = this.setLogicForTraverseAndJump();
	
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
	var jumperHost = new JumperHost();
	var occupancySolver = new OccupancySolver(this.occupancy, this.itemSize);
	
	var doArrayMin = new DoArrayMinFunction();
	var shouldJump = function(bufferIdx) {
		return bufferIdx < bufferCount
			&& !doArrayMin.do(jumperHost.jumper, occupancySolver.getOccupancyFromBufferIdx(bufferIdx))
			&& !!++jumperHost.jumper;
	};
	
	var shouldRecurse = function(bufferIdx) {
		return jumpDecisionBranches[+(shouldJump(bufferIdx))];
	};
	
	var jumpDecisionBranches = new BranchesAsArray(shouldRecurse);
	
	return function(bufferIdx) {
		jumperHost.reset();
		shouldRecurse(bufferIdx)(bufferIdx);
		
		return jumperHost.jumper;
	};
}

MemoryBufferStack.prototype.branchlessLoop = function(callback, startBufferIdx, endBufferIdx) {
	(startBufferIdx < endBufferIdx
		&& callback(startBufferIdx, this.getBuffer(startBufferIdx))		// console.log(startBufferIdx)
		&& (startBufferIdx += this.traverseAndJump(startBufferIdx))
		)
			&& this.branchlessLoop(callback, startBufferIdx, endBufferIdx);
}

MemoryBufferStack.prototype.getOffsetForBuffer = function(bufferIndex) {

	return bufferIndex * this.itemSize;
}

MemoryBufferStack.prototype.getBuffer = function(bufferIndex) {
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

MemoryBufferStack.prototype.append = function(val) {
	if  (!val._byteLength && !val.byteLength)
		return;
	
	// offsets for occupancy map
	var self = this;
	var offset = this._buffer.buffer.byteLength;
	
	this._buffer = new Uint8Array(this._buffer.buffer.append(new ArrayBuffer(val._byteLength || val.byteLength)));
	this._byteLength = this._buffer.byteLength;
	this._buffer.set(val, offset);
	
	if (this.occupancy.byteLength <= (this._byteLength / this.itemSize) / 8)
		this.occupancy = new Uint8Array(this.occupancy.buffer.append(new ArrayBuffer(Math.ceil((val._byteLength || val.byteLength) / (this.itemSize * 8)))));
	
	var occupancyValues = [], idx;
	for (let i = 0, l = (val._byteLength || val.byteLength) / this.itemSize; i < l; i++) {
			idx = Math.floor(i / 8);
			occupancyValues[idx] = occupancyValues[idx] | MemoryBufferStack.eightBitsMasks[ i % 8 ];
	}
	

	self.occupancy.set(occupancyValues, Math.floor((offset / this.itemSize) / 8));
	
}

MemoryBufferStack.prototype.getExpAsFunc = function(exp) {
//	console.log("exp : ' + exp + '", ' + 'curriedFunction, inParam' + ', ' + exp + '); 
	return new Function('doRecurseFunction', 'inParam', 'return ' + exp + ';');
}













MemoryBufferStack.prototype.noOp = function() {
//	console.log('noOp');
}


var BranchesAsArray = function(ifCallClause) {
	return [
		MemoryBufferStack.prototype.noOp,
		ifCallClause
	];
}
BranchesAsArray.prototype = {};






var JumperHost = function() {
	this.jumper = 1;
	
}
JumperHost.prototype.reset = function() {
	this.jumper = 1;
}



var OccupancySolver = function(occupancyBuffer, itemSize) {
	this._buffer = occupancyBuffer;
	this._itemSize = itemSize;
}
OccupancySolver.prototype.getOccupancyFromBufferIdx = function(bufferIdx) {
	var bitFieldOffset = bufferIdx % 8;
	return (this._buffer[Math.floor(bufferIdx / 8)] & MemoryBufferStack.eightBitsMasks[bitFieldOffset]) >> bitFieldOffset;
}
OccupancySolver.prototype.getOccupancyFromAbsoluteIdx = function(absoluteIdx) {
	var bitFieldOffset = (absoluteIdx / this.itemSize) % 8;
	return (this._buffer[Math.floor((absoluteIdx / this.itemSize) / 8)] & MemoryBufferStack.eightBitsMasks[bitFieldOffset]) >> bitFieldOffset;
}




var arrayMin = function(arr) {
	return Math.min.apply(arr);
}

var DoArrayMinFunction = function() {
	// Let's see that as a hint for the optimizer: capture a unique instance of the arrayMin func in the closure
	this.arrMin = arrayMin.bind(null);
	this.cachedArr = [];
}
DoArrayMinFunction.prototype.do = function(val0, val1) {
	this.cachedArr[0] = val0;
	this.cachedArr[1] = val1;
	return this.arrMin(this.cachedArr);
}






module.exports = MemoryBufferStack;