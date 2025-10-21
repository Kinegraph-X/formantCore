/**
 * constructor BufferFromSchema
 */

import BinarySlice from './BinarySlice.js';
import {
    type BinarySchema,
} from './BinarySchema';


/**
 * Represents a binary buffer created from a schema definition,
 * providing easy access to bitwise and bytewise manipulation
 * according to per-property slice definitions.
 */
export default class BufferFromSchema<
    const Keys extends readonly string[],
    TSchema extends BinarySchema<Keys> = BinarySchema<Keys>
    > {
	static objectType = 'BufferFromSchema';

	/** Bit masks for 8-bit operations */
	static readonly eightBitsMasks: number[] = [
		0x01, 0x02, 0x04, 0x08,
		0x10, 0x20, 0x40, 0x80
	];

	/** Map of property names to BinarySlice descriptors */
	public binarySchema: TSchema;

	/** Underlying raw byte buffer */
	public _buffer: Uint8Array;

	/** Occupancy map (tracks which bits/bytes are used) */
	private occupancy: Uint8Array;

	/** Current number of bytes occupied in the buffer */
	public _occupiedLength: number;

	/** Optional array of [propName, offset] pairs, used by getOffsetForProp() */
	private propRef?: Array<[string, number]>;

	/**
	 * Constructs a new binary buffer based on a provided schema.
	 * @param binarySchema - Schema describing property start and length.
	 * @param initialLoad - Optional initial data to load into the buffer.
	 */
	constructor(
		binarySchema: TSchema,
		initialLoad?: Uint8Array | number[]
	) {
		// let offset = 0;
		// for (const prop in binarySchema) {
		// 	this.binarySchema[prop] = new BinarySlice(
		// 		binarySchema[prop].start,
		// 		binarySchema[prop].length
		// 	);
		// 	offset += binarySchema[prop].length;
		// }

		this.binarySchema = binarySchema; 

		// Allocate internal buffers
		const size = binarySchema.size;
		this._buffer = new Uint8Array(size);
		this.occupancy = new Uint8Array(Math.ceil(size / 8));
		this._occupiedLength = 0;

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
	 * @param offset - Optional write offset (defaults to current _occupiedLength).
	 */
	set(val: number[] | Uint8Array, offset?: number): void {
		offset = typeof offset === 'number' ? offset : this._occupiedLength;

		const onAlignmentOffset = offset % 8;
		const startOffset = offset - onAlignmentOffset;

		this._buffer.set(val, offset);
		this.occupancy.set(
			[this.occupancy[startOffset] | BufferFromSchema.eightBitsMasks[onAlignmentOffset]],
			startOffset
		);

		this._occupiedLength = Math.max(offset + val.length, this._occupiedLength);
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

// export function createBufferForSchema<TSchema extends BinarySchema<any>>(
//         schema: TSchema,
//         data?: Uint8Array<ArrayBufferLike> | number[]
//     ): BufferFromSchema<TSchema> {
//         return new BufferFromSchema(schema, data);
//     }