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
	this.jumperHost = new JumperHost();
	this.occupancySolver = new OccupancySolver(this.occupancy, this.itemSize);
	
	var doArrayMin = new DoArrayMinFunction();
	var shouldJump = function(bufferIdx) {
		return !doArrayMin.do(this.jumperHost.jumper, this.occupancySolver.getOccupancyFromBufferIdx(bufferIdx));
	}.bind(this);
	
//	var exp = '0 !== doRecurseFunction(inParam)';
//	var doCallTest  = this.getExpAsFunc(exp);
	
	var shouldRecurse = function(bufferIdx) {
		console.log(shouldJump(bufferIdx));
		
		this.jumperHost.jumper++;
		return jumpDecisiveBranches[+(shouldJump(bufferIdx++))];
		
	}.bind(this);
	
	var jumpDecisiveBranches = new BranchesAsArray(shouldRecurse);
	
	return function(bufferIdx) {
//		console.log(this.jumperHost.jumper, shouldRecurse(bufferIdx));
		
		this.jumperHost.reset();
		shouldRecurse(bufferIdx)(bufferIdx);
		
		console.log(this.jumperHost.jumper);
	}.bind(this);
}

MemoryBufferStack.prototype.getOffsetForBuffer = function(bufferIndex) {

	return bufferIndex * this.itemSize;
}

MemoryBufferStack.prototype.getBuffer = function(bufferIndex) {
//	console.log(bufferIndex);
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
//	console.log(val._byteLength, val.byteLength, val, Math.ceil((val._byteLength || val.byteLength) / 8));
	
	if (this.occupancy.byteLength <= (this._byteLength / this.itemSize) / 8)
		this.occupancy = new Uint8Array(this.occupancy.buffer.append(new ArrayBuffer(Math.ceil((val._byteLength || val.byteLength) / (this.itemSize * 8)))));
//	console.log(val);
	
	var occupancyValues = [], idx;
	for (let i = 0, l = (val._byteLength || val.byteLength) / this.itemSize; i < l; i++) {
//		(function() {
			idx = Math.floor(i / 8);
//			console.log(offset, self.occupancy[Math.floor(i / 8)] | MemoryBufferStack.eightBitsMasks[ i % 8 ], Math.floor(i / 8));
			occupancyValues[idx] = occupancyValues[idx] | MemoryBufferStack.eightBitsMasks[ i % 8 ];
//			console.log(self.occupancy);
//		})();
	}
	
//	console.log(occupancyValues, offset, this.occupancy);
	self.occupancy.set(occupancyValues, Math.floor((offset / this.itemSize) / 8));
	
}

MemoryBufferStack.prototype.traverse = function(callback) {
	var currentOffset = 0;
	var maxOffset = this._byteLength / this.itemSize - 1;

	// Instanciate a new jumperHost
	// Pass jumperHost to the initJumper function
	// Instanciate the whole closure hierarchy
	// Assign the returned implicitTestFunction to a variable named "GetNextJump"
//	var jumperHost = new JumperHost();
//	var jumperCallback = this.initJumper(jumperHost);
//	var GetNextJump = this.traversingSequenceGetNextJumpFunction(jumperCallback);
	
	
	
	// A jump implies:
	// Call "GetNextJump(byteIdx)"
	// Access jumperHost to get the length of the jump
	// Reset jumperHost
	// Loop
	
	while (currentOffset < maxOffset) {
//		console.log(currentOffset, maxOffset);
		GetNextJump(currentOffset);
		currentOffset += jumperHost.jumper;
		callback(this._buffer, currentOffset * this.itemSize, this.itemSize);
		jumperHost.jumper = 1;
	}
	
//	console.log(this._buffer.buffer);
}

MemoryBufferStack.prototype.traversingSequenceGetNextJumpFunction = function(jumperCallback) {
	return this.getImplicitTestFunction(jumperCallback);
}

MemoryBufferStack.prototype.initJumper = function(jumperHost) {
//	var capturedArray = [];
//	var res = 0;
//	var exp = '0 !== curriedFunction(inParam)';
//	// Let's see that as a hint for the optimizer: capture a unique instance of the arrayMin func in the closure
//	var arrMin = arrayMin.bind(null);
	
	function jumperFunction(bufferIdx) {
		capturedArray[0] = jumperHost.jumper;
		capturedArray[1] = this.getNextOccupancyValue(bufferIdx);
		res = arrMin(capturedArray);
//		console.log(jumperHost.jumper);
		jumperHost.jumper++;
//		console.log(jumperHost.jumper);
		return res;
	}
	
	return MemoryBufferStack.prototype.getExpAsFunc.call(null, exp).bind(null, jumperFunction.bind(this));
}

MemoryBufferStack.prototype.getExpAsFunc = function(exp) {
//	console.log("exp : ' + exp + '", ' + 'curriedFunction, inParam' + ', ' + exp + '); 
	return new Function('doRecurseFunction', 'inParam', 'return ' + exp + ';');
}

MemoryBufferStack.prototype.getImplicitTestFunction = function(lambda) {
	var branches = new Array(2);
	
	var implicitTestFunction = function (bufferIdx) {
//		console.log(branches[Number(lambda(bufferIdx))]);
		return branches[Number(!!lambda(bufferIdx))];
	};
	
	branches[0] = MemoryBufferStack.prototype.recursivelyCall.bind(this, implicitTestFunction);
	branches[1] = MemoryBufferStack.prototype.noOp;
	
	return implicitTestFunction; 
}

MemoryBufferStack.prototype.recursivelyCall = function(implicitTestFunction, bufferIdx) {
//	console.log(this.getNextOccupancyValue(byteIdx));
	return implicitTestFunction(bufferIdx)(this.getNextOccupancyValue(bufferIdx));
}

MemoryBufferStack.prototype.getNextOccupancyValue = function(bufferIdx) {
//	console.log(bufferIdx, (this.occupancy[Math.floor(bufferIdx / this.itemSize)] & MemoryBufferStack.eightBitsMasks[bufferIdx % this.itemSize]) >> (bufferIdx % this.itemSize));
	bufferIdx++;
	return (this.occupancy[Math.floor(bufferIdx / this.itemSize)] & MemoryBufferStack.eightBitsMasks[bufferIdx % this.itemSize]) >> (bufferIdx % this.itemSize);
}

MemoryBufferStack.prototype.noOp = function() {
	console.log('noOp');
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






var JumperHost = function() {
	this.jumper = 0;
	
}
JumperHost.prototype.reset = function() {
	this.jumper = 0;
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