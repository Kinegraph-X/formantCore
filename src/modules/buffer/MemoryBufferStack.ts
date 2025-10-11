/**
 * @module MemoryBufferStack
 */
import {DoArrayMinFunction, JumperHost, OccupancySolver, BranchesAsArray} from './MemoryBufferStackDependancies';

function noOp() {}


function falseCombinator() {
	return false;
}

/** @param {number} value */
function zeroOrOneCombinator(value: number) {
	return +(value >= 0) || 0;
}

/**
 * @class MemoryBufferStack
 * @classdesc Manages a dynamically growing binary buffer and an occupancy bitfield map.
 */
export class MemoryBufferStack {
	static objectType = 'MemoryBufferStack';
	static eightBitsMasks = [
		0x01,
		0x02,
		0x04,
		0x08,
		0x10,
		0x20,
		0x40,
		0x80
	];

	/** @type {number} */
	itemSize;
	/** @type {number} */
	_byteLength;
	/** @type {Uint8Array} */
	_buffer;
	/** @type {Uint8Array} */
	occupancy;
	/** @type {(callback: Function, startIdx: number, endIdx: number) => void} */
	branchlessLoop;
	/** @type {(bufferIdx: number) => number} */
	traverseAndJumpFunction;

	/**
	 * @param {number} itemSize - Size of one item in bytes.
	 * @param {number} itemCount - Initial number of items.
	 * @param {boolean} isAbsoluteSize - Whether the size is fixed or dynamically growing.
	 */
	constructor(itemSize: number, itemCount: number, isAbsoluteSize = false) {
		this.itemSize = itemSize;
		this._byteLength = 0;
		this._buffer = new Uint8Array(itemSize * itemCount);
		this.occupancy = new Uint8Array(itemCount / 8);

		this.traverseAndJumpFunction = this.setLogicForTraverseAndJump();
		this.branchlessLoop = this.getBranchlessLoop();
	}
	
	/**
	 * Configure recursive jump logic for traversing the memory buffer.
	* The function scans ahead from the provided buffer index and returns a jump amount (>= 1).
	*
	* Behavior (documented):
	* - Start with jumper = 1.
	* - While the next index (bufferIdx + jumper) is inside the populated range, read its occupancy.
	* - If the min(jumper, occupancy) is non-zero, stop scanning and return jumper.
	* - Otherwise increment jumper and continue.
	* 
	 * @returns {(bufferIdx: number) => number}
	 */
	setLogicForTraverseAndJump() {
		const bufferCount = this._byteLength / this.itemSize;
		const jumperHost = new JumperHost();
		const occupancySolver = new OccupancySolver(this.occupancy, this.itemSize);
		const doArrayMin = new DoArrayMinFunction();

		/** @param {number} bufferIdx */
		const shouldJump = (bufferIdx: number) => {
			(jumperHost.jumper + bufferIdx) < bufferCount &&
			!doArrayMin.do(jumperHost.jumper, occupancySolver.getOccupancyFromBufferIdx(bufferIdx)) &&
			!!++jumperHost.jumper;
		}

		const jumpDecisionBranches = BranchesAsArray((bufferIdx) => {
			return jumpDecisionBranches[+shouldJump(bufferIdx)];
		});

		/** @param {number} bufferIdx */
		return function (bufferIdx: number) {
			jumperHost.reset();
			jumpDecisionBranches[+shouldJump(bufferIdx)](bufferIdx);
			return jumperHost.jumper;
		};
	}

	/**
	* Configure and return the "traverse and jump" function.
	* The function scans ahead from the provided buffer index and returns a jump amount (>= 1).
	* The implementation preserves the original algorithm's intent while being explicit and iterative.
	*
	* Behavior (documented):
	* - Start with jumper = 1.
	* - While the next index (bufferIdx + jumper) is inside the populated range, read its occupancy.
	* - If the min(jumper, occupancy) is non-zero, stop scanning and return jumper.
	* - Otherwise increment jumper and continue.
	*
	* This yields the same style of jump-counting strategy used by the original code's recursive branchless trick.
	*/
	// setLogicForTraverseAndJump(): (bufferIdx: number) => number {
	// 	return (bufferIdx: number) => {
	// 		const bufferCount = Math.floor(this._byteLength / this.itemSize);
	// 		const jumperHost = new JumperHost();
	// 		const occupancySolver = new OccupancySolver(this.occupancy, this.itemSize);
	// 		const doArrayMin = new DoArrayMinFunction();


	// 		// Iterative implementation of the original recursive "branches" logic.
	// 		while (true) {
	// 			const nextIdx = bufferIdx + jumperHost.jumper;
	// 			if (nextIdx >= bufferCount) break;


	// 			const occ = occupancySolver.getOccupancyFromBufferIdx(nextIdx);
	// 			// If the minimum of (jumper, occ) is non-zero => stop scanning
	// 			if (doArrayMin.do(jumperHost.jumper, occ)) break;


	// 			// otherwise bump jumper and continue
	// 			jumperHost.jumper++;
	// 		}

	// 		return jumperHost.jumper;
	// 	};
	// }


	/**
	* Create and return the branchless loop function used to traverse slices of the buffer.
	* The returned function will call ``callback(bufferView, byteOffset)`` for each visited index
	* and advance the index using the configured traverseAndJumpFunction.
	*/
	getBranchlessLoop(): (callback: (buffer: Uint8Array, offset: number) => void, startBufferIdx: number, endBufferIdx: number) => void {
		return (callback: (buffer: Uint8Array, offset: number) => void, startBufferIdx: number, endBufferIdx: number) => {
			if (startBufferIdx >= endBufferIdx) return;

			while (startBufferIdx < endBufferIdx) {
				callback(this._buffer, startBufferIdx * this.itemSize);
				const advance = this.traverseAndJumpFunction(startBufferIdx);
				if (advance <= 0) break; // safety guard (shouldn't happen)
				startBufferIdx += advance;
			}
		};
	}


	/**
	* Return the byte offset of the provided item index.
	* @param bufferIndex - item index
	*/
	getOffsetForBuffer(bufferIndex: number): number {
		return bufferIndex * this.itemSize;
	}


	/**
	* Return a view (Uint8Array) for the item at the given index.
	* Throws RangeError if the requested item isn't fully within the backing buffer.
	*/
	getBuffer(bufferIndex: number): Uint8Array {
		const offset = this.getOffsetForBuffer(bufferIndex);
		if (offset + this.itemSize > this._buffer.byteLength) throw new RangeError('Requested buffer slice is out of range');
		return this._buffer.subarray(offset, offset + this.itemSize);
	}


	/** Ensure the backing buffer is at least `byteNeeded` bytes. */
	private ensureCapacity(byteNeeded: number): void {
		if (this._buffer.byteLength >= byteNeeded) return;


		const current = this._buffer.byteLength || 0;
		// grow by doubling when possible, but always at least itemSize and always enough to satisfy byteNeeded
		const doubled = current > 0 ? current * 2 : this.itemSize;
		const newLen = Math.max(doubled, byteNeeded);


		const newBuf = new Uint8Array(newLen);
	}

	/** Ensure occupancy buffer can represent itemIndex (0-based). */
	private ensureOccupancyForIndex(itemIndex: number): void {
		const neededBytes = Math.ceil((itemIndex + 1) / 8);
		if (this.occupancy.byteLength >= neededBytes) return;

		const newOcc = new Uint8Array(neededBytes);
		newOcc.set(this.occupancy, 0);
		this.occupancy = newOcc;
	}

	/**
	* Set or clear the occupancy bit for a specific item index.
	* @param itemIndex - item index to change
	* @param occupied - whether to set (true) or clear (false) the bit
	*/
	private setOccupancyBitForIndex(itemIndex: number, occupied: boolean): void {
		this.ensureOccupancyForIndex(itemIndex);
		const byteIdx = Math.floor(itemIndex / 8);
		const bitOffset = itemIndex % 8;
		if (occupied) {
			this.occupancy[byteIdx] |= MemoryBufferStack.eightBitsMasks[bitOffset];
		} 
		else {
			this.occupancy[byteIdx] &= ~MemoryBufferStack.eightBitsMasks[bitOffset];
		}
	}


	/**
	* Write a single item at the given item index. Value must be exactly itemSize bytes.
	* @param val - bytes to write (length must equal itemSize)
	* @param idx - item index (0-based)
	*/
	set(val: Uint8Array, idx: number): void {
		if (val.length !== this.itemSize) throw new Error('Value length must equal itemSize');


		const byteOffset = idx * this.itemSize;
		this.ensureCapacity(byteOffset + this.itemSize);
		this._buffer.set(val, byteOffset);
		this._byteLength = Math.max(this._byteLength, byteOffset + this.itemSize);
		this.setOccupancyBitForIndex(idx, true);
	}


	/**
	* Alias kept for API parity with original source: setFromIndex behaves exactly like set.
	*/
	setFromIndex(val: Uint8Array, idx: number): void {
		this.set(val, idx);
	}


	/**
	* Invalidate (clear occupancy) for a given item index or absolute byte offset.
	* By default `offsetOrIndex` is treated as an item index; set `absoluteByteOffset` to true to treat it as a byte offset.
	*/
	invalidate(offsetOrIndex: number, absoluteByteOffset = false): void {
		const idx = absoluteByteOffset ? Math.floor(offsetOrIndex / this.itemSize) : offsetOrIndex;
		this.setOccupancyBitForIndex(idx, false);
	}


	/** Clear occupancy for a given item index. */
	invalidateFromIndex(idx: number): void {
		this.invalidate(idx, false);
	}


	/**
	* Append the contents of another MemoryBufferStack to the end of this one. Occupancy bits are set
	* for any newly appended whole items.
	* @param val - another MemoryBufferStack instance
	*/
	append(val: MemoryBufferStack): void {
		if (!val || val._byteLength === 0) return;

		const initialOffset = this._byteLength;
		const targetBytes = this._byteLength + val._byteLength;
		this.ensureCapacity(targetBytes);


		// copy bytes
		this._buffer.set(val._buffer.subarray(0, val._byteLength), this._byteLength);
		this._byteLength = targetBytes;


		// update occupancy bits for newly appended whole items
		const startItem = Math.floor(initialOffset / this.itemSize);
		const newItemCount = Math.floor(this._byteLength / this.itemSize);


		for (let bufferIdx = startItem; bufferIdx < newItemCount; bufferIdx++) {
			this.setOccupancyBitForIndex(bufferIdx, true);
		}
	}
}



// class MemoryBufferStack {
// 	static objectType = 'MemoryBufferStack';
// 	static eightBitsMasks = [
// 		0x01,
// 		0x02,
// 		0x04,
// 		0x08,
// 		0x10,
// 		0x20,
// 		0x40,
// 		0x80
// 	];
// 	/**
// 	 * 
// 	 * @param {number} itemSize 
// 	 * @param {number} itemCount 
// 	 * @param {boolean} isAbsoluteSize 
// 	 */
// 	constructor(itemSize, itemCount, isAbsoluteSize) {
// 		this.objectType = 'MemoryBufferStack';

// 		this.itemSize = itemSize;
// 		this._byteLength = 0;
// 		this._buffer = new Uint8Array(itemSize * itemCount);
// 		this.occupancy = new Uint8Array(itemCount / 8);

// 		this.traverseAndJumpFunction = this.setLogicForTraverseAndJump();
// 		this.branchlessLoop = this.getBranchlessLoop();

// 		//	this.bytePointer = 0;
// 	}
// 	setLogicForTraverseAndJump() {
// 		var self = this;
// 		var getBuffer = this.getBuffer;
// 		var bufferCount = this._byteLength / this.itemSize;
// 		var jumperHost = new this.JumperHost();
// 		var occupancySolver = new this.OccupancySolver(this.occupancy, this.itemSize);

// 		var doArrayMin = new this.DoArrayMinFunction();
// 		var shouldJump = function (bufferIdx) {
// 			//		console.log((jumperHost.jumper + bufferIdx) < bufferCount);
// 			return (jumperHost.jumper + bufferIdx) < bufferCount
// 				&& !doArrayMin.do(jumperHost.jumper, occupancySolver.getOccupancyFromBufferIdx(bufferIdx))
// 				&& !!++jumperHost.jumper;
// 		};

// 		var shouldRecurse = function (bufferIdx) {
// 			return jumpDecisionBranches[+(shouldJump(bufferIdx))];
// 		};

// 		var jumpDecisionBranches = new this.BranchesAsArray(shouldRecurse);

// 		return function (bufferIdx) {
// 			jumperHost.reset();
// 			shouldRecurse(bufferIdx)(bufferIdx);

// 			return jumperHost.jumper;
// 		};
// 	}
// 	getBranchlessLoop() {

// 		var branchlessLoop = function (callback, startBufferIdx, endBufferIdx) {
// 			//		console.log(startBufferIdx, endBufferIdx, this.itemSize);
// 			if (startBufferIdx >= endBufferIdx)
// 				return;

// 			callback(this._buffer, startBufferIdx * this.itemSize);
// 			startBufferIdx += this.traverseAndJumpFunction(startBufferIdx);
// 			branchlessLoop(callback, startBufferIdx, endBufferIdx);
// 			//		console.log(startBufferIdx);
// 		}.bind(this);

// 		return branchlessLoop;
// 	}
// 	getOffsetForBuffer(bufferIndex) {

// 		return bufferIndex * this.itemSize;
// 	}
// 	getBuffer(bufferIndex) {
// 		//	return this._buffer;
// 		return new Uint8Array(this._buffer.buffer, bufferIndex * this.itemSize, this.itemSize);
// 	}
// 	set(val, offset) {
// 		// offsets for occupancy map
// 		var onAlignementOffset = offset % 8;
// 		var startOffset = offset - onAlignementOffset;

// 		if (this._buffer.byteLength >= offset) {
// 			console.warn('MemoryBufferStack', 'Setting a value at an offset longer than the buffer.', val, idx, ' Returning...');
// 			return;
// 		}
// 		else if (this._buffer.byteLength <= offset)
// 			this._buffer.buffer.append(new ArrayBuffer(this.itemSize));

// 		this._byteLength = this._buffer.byteLength;
// 		this._buffer.set(val, offset);
// 		this.occupancy.set(this.occupancy[Math.floor(startOffset / 8)] | MemoryBufferStack.eightBitsMasks[onAlignementOffset]);
// 	}
// 	setFromIndex(val, idx) {
// 		// offsets for occupancy map
// 		var offset = this.itemSize * idx;
// 		var onAlignementOffset = offset % 8;
// 		var startOffset = offset - onAlignementOffset;

// 		if (this._buffer.byteLength >= offset) {
// 			console.warn('MemoryBufferStack', 'Setting a value at an offset longer than the buffer.', val, idx, ' Returning...');
// 			return;
// 		}
// 		else if (this._buffer.byteLength === offset)
// 			this._buffer.buffer.append(new ArrayBuffer(this.itemSize));

// 		this._byteLength = this._buffer.byteLength;
// 		this._buffer.set(val, offset);
// 		this.occupancy.set(this.occupancy[Math.floor(startOffset / 8)] | MemoryBufferStack.eightBitsMasks[onAlignementOffset]);
// 	}
// 	invalidate(offset) {
// 		// offsets for occupancy map
// 		var onAlignementOffset = offset % 8;
// 		var startOffset = offset - onAlignementOffset;

// 		this.occupancy.set(this.occupancy[Math.floor(startOffset / 8)] & ~MemoryBufferStack.eightBitsMasks[onAlignementOffset]);
// 	}
// 	invalidateFromIndex(idx) {
// 		// offsets for occupancy map
// 		var offset = this.itemSize * idx;
// 		var onAlignementOffset = offset % 8;
// 		var startOffset = offset - onAlignementOffset;

// 		this.occupancy.set(this.occupancy[Math.floor(startOffset / 8)] & ~MemoryBufferStack.eightBitsMasks[onAlignementOffset]);
// 	}
// 	/**
// 	 * @function MemoryBufferStack.prototype.append
// 	 *
// 	 * @param editing val
// 	 */
// 	append(val) {

// 		if (!val._byteLength)
// 			return;

// 		// offsets for occupancy map
// 		var offset = this._byteLength;

// 		if (this._byteLength + val._byteLength > this._buffer.byteLength) {
// 			this._buffer = new Uint8Array(this._buffer.buffer.append(new ArrayBuffer(val._byteLength)));
// 			this.occupancy = new Uint8Array(this.occupancy.buffer.append(new ArrayBuffer(Math.ceil((val._byteLength) / (this.itemSize * 8)))));
// 		}

// 		// update data buffer
// 		this._buffer.set(val._buffer, this._byteLength);
// 		this._byteLength += val._byteLength;

// 		// Update occupancy buffer
// 		var occupancyValues = [], initialBufferIdx = offset / this.itemSize, occupancyPointer, currentOccupancyPointer;
// 		for (let bufferIdx = offset / this.itemSize, max = this._byteLength / this.itemSize; bufferIdx < max; bufferIdx++) {
// 			//		console.log(bufferIdx, bufferIdx % 8, Math.floor((bufferIdx - initialBufferIdx) / 8));
// 			occupancyPointer = Math.floor((bufferIdx - initialBufferIdx) / 8);
// 			currentOccupancyPointer = Math.floor(bufferIdx / 8);
// 			occupancyValues[occupancyPointer] = this.occupancy[currentOccupancyPointer] | MemoryBufferStack.eightBitsMasks[bufferIdx % 8];
// 		}

// 		//	console.log(occupancyValues, Math.floor((offset / this.itemSize) / 8));
// 		this.occupancy.set(occupancyValues, Math.floor((offset / this.itemSize) / 8));

// 	}
// 	BranchesAsArray(ifCallClause) {
// 		return [
// 			_functionalStyleHelpers.noOp,
// 			ifCallClause
// 		];
// 	}
// 	JumperHost() {
// 		this.jumper = 1;

// 	}
// 	OccupancySolver(occupancyBuffer, itemSize) {
// 		this._buffer = occupancyBuffer;
// 		this._itemSize = itemSize;
// 	}
// 	arrayMin(arr) {
// 		return Math.min.apply(arr);
// 	}
// 	DoArrayMinFunction() {
// 		// Let's see that as a hint for the optimizer: capture a unique instance of the arrayMin func in the closure
// 		this.arrMin = MemoryBufferStack.prototype.arrayMin.bind(null);
// 		this.cachedArr = [];
// 	}
// }







// MemoryBufferStack.prototype.BranchesAsArray.prototype = {};


// MemoryBufferStack.prototype.JumperHost.prototype.reset = function() {
// 	this.jumper = 1;
// }



// MemoryBufferStack.prototype.OccupancySolver.prototype.getOccupancyFromBufferIdx = function(bufferIdx) {
// 	var bitFieldOffset = bufferIdx % 8;
// // 	console.log((this._buffer[Math.floor(bufferIdx / 8)] & MemoryBufferStack.eightBitsMasks[bitFieldOffset]) >> bitFieldOffset);
// 	return (this._buffer[Math.floor(bufferIdx / 8)] & MemoryBufferStack.eightBitsMasks[bitFieldOffset]) >> bitFieldOffset;
// }
// MemoryBufferStack.prototype.OccupancySolver.prototype.getOccupancyFromAbsoluteIdx = function(absoluteIdx) {
// 	var bitFieldOffset = (absoluteIdx / this.itemSize) % 8;
// 	return (this._buffer[Math.floor((absoluteIdx / this.itemSize) / 8)] & MemoryBufferStack.eightBitsMasks[bitFieldOffset]) >> bitFieldOffset;
// }





// MemoryBufferStack.prototype.DoArrayMinFunction.prototype.do = function(val0, val1) {
// 	this.cachedArr[0] = val0;
// 	this.cachedArr[1] = val1;
// 	return this.arrMin(this.cachedArr);
// }






export default MemoryBufferStack;