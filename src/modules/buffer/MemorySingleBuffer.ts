/**
 * constructor BufferFromSchema
 */

import BinarySlice from './BinarySlice.js';
import {BinarySchemaFactory} from './BinarySchema';


/**
 * Represents a binary buffer created from a schema definition,
 * providing easy access to bitwise and bytewise manipulation
 * according to per-property slice definitions.
 */
export default class BufferFromSchema {
	static objectType = 'BufferFromSchema';

	/** Bit masks for 8-bit operations */
	static readonly eightBitsMasks: number[] = [
		0x01, 0x02, 0x04, 0x08,
		0x10, 0x20, 0x40, 0x80
	];

	/** Map of property names to BinarySlice descriptors */
	public binarySchema: Record<string, BinarySlice> = {};

	/** Underlying raw byte buffer */
	private _buffer: Uint8Array;

	/** Occupancy map (tracks which bits/bytes are used) */
	private occupancy: Uint8Array;

	/** Current number of bytes occupied in the buffer */
	private _byteLength: number;

	/** Optional array of [propName, offset] pairs, used by getOffsetForProp() */
	private propRef?: Array<[string, number]>;

	/**
	 * Constructs a new binary buffer based on a provided schema.
	 * @param binarySchema - Schema describing property start and length.
	 * @param initialLoad - Optional initial data to load into the buffer.
	 */
	constructor(
		binarySchema: Record<string, { start: number; length: number; size?: number }>,
		initialLoad?: Uint8Array | number[]
	) {
		let offset = 0;
		for (const prop in binarySchema) {
			this.binarySchema[prop] = new BinarySlice(
				binarySchema[prop].start,
				binarySchema[prop].length
			);
			offset += binarySchema[prop].length;
		}

		// Allocate internal buffers
		const size = offset;
		this._buffer = new Uint8Array(size);
		this.occupancy = new Uint8Array(Math.ceil(size / 8));
		this._byteLength = 0;

		// Preload if data is provided
		if (initialLoad) this.set(initialLoad, 0);
	}

	/**
	 * Retrieve a value from the buffer.
	 * - If `binaryLength` is omitted, returns a single byte.
	 * - If provided, reconstructs an integer spanning multiple bytes.
	 * @param idx - Byte offset to start reading from.
	 * @param binaryLength - Optional number of bytes to combine.
	 */
	get(idx: number, binaryLength?: number): number {
		if (!binaryLength) {
			return this._buffer[idx];
		} else {
			// Unpack multi-byte integers
			let ret = 0;
			let bitwiseOffset = 0;
			for (let i = idx, l = idx + binaryLength; i < l; i++) {
				ret |= this._buffer[i] << (bitwiseOffset * 8);
				bitwiseOffset++;
			}
			return ret;
		}
	}

	/**
	 * Get the byte offset for a given property name.
	 * @param propName - The name of the property.
	 * @returns The starting byte offset or 0 if not found.
	 */
	getOffsetForProp(propName: string): number {
		if (!this.propRef) return 0;
		let offset = 0;
		this.propRef.forEach(([name, pos]) => {
			if (name === propName) offset = pos;
		});
		return offset;
	}

	/**
	 * Write bytes into the buffer and mark their occupancy.
	 * @param val - Value(s) to write (array or typed array).
	 * @param offset - Optional write offset (defaults to current _byteLength).
	 */
	set(val: number[] | Uint8Array, offset?: number): void {
        /** @ts-ignore : checked while assigning */
		(val) = Array.isArray(val) || Object.getPrototypeOf(val) === Uint8Array.prototype ? val : [val];
		offset = typeof offset === 'number' ? offset : this._byteLength;

		const onAlignmentOffset = offset % 8;
		const startOffset = offset - onAlignmentOffset;

		this._buffer.set(val, offset);
		this.occupancy.set(
			[this.occupancy[startOffset] | BufferFromSchema.eightBitsMasks[onAlignmentOffset]],
			startOffset
		);

		this._byteLength = Math.max(offset + val.length, this._byteLength);
	}

	/**
	 * Invalidate a byte at a given offset (clear occupancy bit).
	 * @param offset - The byte offset to invalidate.
	 */
	invalidate(offset: number): void {
		const onAlignmentOffset = offset % 8;
		const startOffset = offset - onAlignmentOffset;
		this.occupancy.set(
			[this.occupancy[startOffset] & ~BufferFromSchema.eightBitsMasks[onAlignmentOffset]],
			startOffset
		);
	}

	/**
	 * @todo Implement logic to derive total binary length from `binarySchema`.
	 * @todo Consider using DataView for >8-bit integer handling.
	 */
}



// class BufferFromSchema {
// 	static objectType = 'BufferFromSchema';
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

// 	constructor(binarySchema, initialLoad) {
// 		this.objectType = 'BufferFromSchema';

// 		this.binarySchema = {};
// 		var offset = 0;
// 		for (var prop in binarySchema) {
// 			if (!binarySchema.hasOwnProperty(prop))
// 				return;
// 			this.binarySchema[prop] = new BinarySlice(
// 				binarySchema[prop].start,
// 				binarySchema[prop].length
// 			);
// 			offset += binarySchema[prop].length;
// 		}
// 		//	console.log(binarySchema.size);
// 		this._buffer = new Uint8Array(binarySchema.size);
// 		this.occupancy = new Uint8Array(binarySchema.size / 8);
// 		this._byteLength = 0;

// 		if (initialLoad)
// 			this.set(initialLoad, 0);

// 		//	console.log(this.binarySchema);
// 	}
// 	// TODO: retrieve the binary length from the BinarySchema
// 	// TODO: benchmark resolving integers that are longer than 8bits
// 	// using a DataView or another TypedArray
// 	get(idx, binaryLength) {
// 		if (!binaryLength)
// 			return this._buffer[idx];
// 		else {
// 			// we unpack 16 and 32 bits integers here
// 			var ret = 0, bitwiseOffset = 0;
// 			for (let i = idx, l = idx + binaryLength; i < l; i++) {
// 				ret = ret | (this._buffer[i] << bitwiseOffset * 8);
// 				bitwiseOffset++;
// 			}
// 			return ret;
// 		}
// 	}
// 	getOffsetForProp(propName) {
// 		var offset = 0;
// 		this.propRef.forEach(function (propAsArray) {
// 			if (propAsArray[0] === propName)
// 				offset = propAsArray[1];
// 		});
// 		return offset;
// 	}
// 	set(val, offset) {
// 		val = (Array.isArray(val) || Object.getPrototypeOf(val) === Uint8Array.prototype) ? val : [val];
// 		// offsets for occupancy map
// 		offset = typeof offset !== 'number' ? this._byteLength : offset;
// 		var onAlignementOffset = offset % 8;
// 		var startOffset = offset - onAlignementOffset;

// 		this._buffer.set(val, offset);
// 		this.occupancy.set([this.occupancy[startOffset] | BufferFromSchema.eightBitsMasks[onAlignementOffset]]);
// 		this._byteLength = (offset && Math.max(offset + val.length, this._byteLength)) || val.length;
// 		//	console.log(this._byteLength);
// 	}
// 	invalidate(offset) {
// 		// offsets for occupancy map
// 		var onAlignementOffset = offset % 8;
// 		var startOffset = offset - onAlignementOffset;

// 		this.occupancy.set(this.occupancy[startOffset] & ~BufferFromSchema.eightBitsMasks[onAlignementOffset]);
// 	}
// }


// export default BufferFromSchema;