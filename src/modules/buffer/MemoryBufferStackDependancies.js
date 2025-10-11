/**
 * @class JumperHost
 * @classdesc Small helper that stores the running 'jumper' counter used by the traversal logic.
 */
export class JumperHost {
	/** @type {number} */
	jumper;

	constructor() {
		this.jumper = 1;
	}

	/** Reset the jumper back to 1. */
	reset() {
		this.jumper = 1;
	}
}

/**
 * @class OccupancySolver
 * @classdesc Bit-field reader for the occupancy map. The occupancy map stores 1 bit per item. Provides bitwise occupancy lookup for the memory buffer.
 */
export class OccupancySolver {
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

	/** @type {Uint8Array} */
	_buffer;
	/** @type {number} */
	_itemSize;

	/**
	 * @param {Uint8Array} occupancyBuffer - The occupancy bitfield buffer.
	 * @param {number} itemSize - The number of bytes per item.
	 */
	constructor(occupancyBuffer, itemSize) {
		this._buffer = occupancyBuffer;
		this._itemSize = itemSize;
	}

	/**
	 * Get occupancy bit for a given buffer index.
	 * @param {number} bufferIdx - The buffer index to check.
	 * @returns {number} 1 if occupied, 0 if free.
	 */
	getOccupancyFromBufferIdx(bufferIdx) {
		const bitFieldOffset = bufferIdx % 8;
		return (this._buffer[Math.floor(bufferIdx / 8)] & OccupancySolver.eightBitsMasks[bitFieldOffset]) >> bitFieldOffset;
	}

	/**
	 * Get occupancy bit for a given absolute byte index.
	 * @param {number} absoluteIdx - The absolute byte index to check.
	 * @returns {number} 1 if occupied, 0 if free.
	 */
	getOccupancyFromAbsoluteIdx(absoluteIdx) {
		const bitFieldOffset = (absoluteIdx / this._itemSize) % 8;
		return (this._buffer[Math.floor((absoluteIdx / this._itemSize) / 8)] & OccupancySolver.eightBitsMasks[bitFieldOffset]) >> bitFieldOffset;
	}
}

/**
 * @class DoArrayMinFunction
 * @classdesc Tiny micro-optimizer used by the original code to compute the min of two numbers
 * while reusing an array container. Here we keep the same shape but implement it more cleanly
 */
export class DoArrayMinFunction {
	/** @type {(...arr: number[]) => number} */
	arrMin;
	/** @type {number[]} */
	cachedArr;

	constructor() {
		this.arrMin = Math.min.bind(null);
		this.cachedArr = [];
	}

	/**
	 * Compare two values and return the minimum.
	 * @param {number} val0
	 * @param {number} val1
	 * @returns {number}
	 */
	do(val0, val1) {
		this.cachedArr[0] = val0;
		this.cachedArr[1] = val1;
		return this.arrMin.apply(this.cachedArr);
	}
}

/**
 * @function BranchesAsArray
 * @description Return an array shaped like [noOp, ifCallClause] to emulate the original 'branchless' trick.
 * @param {(arg: number) => any} ifCallClause - function to be placed in array index 1. Function to be called when branch condition is true.
 * @returns {Function[]} An array containing [noOp, ifCallClause].
 */
export function BranchesAsArray(ifCallClause) {
	return [
		() => {}, // noOp
		ifCallClause
	];
}
