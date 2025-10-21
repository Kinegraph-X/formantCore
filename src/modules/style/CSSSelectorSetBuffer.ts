/**
 * @module CSSSelectorSetBuffer
 */

// ts-noCheck

import {getNcharsAsCharCodesArray} from '../nativeTypesUtilities/StringUtilities';
import CSSSelectorsList, {schemaProps} from './CSSSelectorsList.js';
import MemoryMapBuffer from '../buffer/MemoryMapBuffer';
import MemorySingleBuffer from '../buffer/MemorySingleBuffer';
import {generatorFor16bitsInt} from '../UIDGenerator.js';



/**
 * Manages a set of compacted CSS selectors backed by a memory map buffer.
 *
 * Extends MemoryMapBuffer; stores entries in a single large buffer.
 * Builds from a CSSSelectorsList via populateFromSelectorsList.
 */
class CSSSelectorSetBuffer extends MemoryMapBuffer {
	static objectType = 'CSSSelectorSetBuffer';
	/** @type {string[]} */
	entryList : string[] = [];
	/**
	 * @param {CSSSelectorsList} selectorsList
	 */
	constructor(selectorsList : CSSSelectorsList) {
		super(CSSSelectorsList.selectorAsBufferSchema.size, 0);
		this.itemSize = CSSSelectorsList.selectorAsBufferSchema.size;
		this._byteLength = 0;

		if (selectorsList)
			this.populateFromSelectorsList(selectorsList);
	}
	/**
	 * @param {string} entryName
	 * @returns {number}
	 */
	getPosForEntry(entryName : string) {
		var entryIdx = 0;
		if ((entryIdx = this.entryList.indexOf(entryName)) !== -1) {
			return entryIdx;
		}
		return -1;
	}
	/**
	 * @param {number} pos
	 * @returns {string}
	 */
	getEntryForPos(pos : number) {
		return this.entryList[pos];
	}
	/**
	 * @param {string} entryName
	 * @returns {MemorySingleBuffer<typeof schemaProps, typeof CSSSelectorsList.selectorAsBufferSchema>}
	 */
	getEntry(entryName : string) {
		var posForEntry = this.getPosForEntry(entryName) * this.itemSize;
		//	console.log(entryName, posForEntry, this._buffer, this._buffer.slice(posForEntry, posForEntry + this.itemSize));
		// if (posForEntry < 0)
		// 	return createBufferForSchema(CSSSelectorsList.selectorAsBufferSchema);

		var propAsBuffer = new MemorySingleBuffer<typeof schemaProps, typeof CSSSelectorsList.selectorAsBufferSchema>(
			CSSSelectorsList.selectorAsBufferSchema,
			this._buffer.slice(posForEntry, posForEntry + this.itemSize)
		);
		return propAsBuffer;
	}
	/**
	 * @param {string} entryName
	 * @param {MemorySingleBuffer<any>} selectorBuffer
	 */
	addEntryFromBuffer(
		entryName : string,
		selectorBuffer : MemorySingleBuffer<typeof schemaProps, typeof CSSSelectorsList.selectorAsBufferSchema>
	) {
		if (this._byteLength + selectorBuffer._occupiedLength > this._buffer.byteLength) {
			this._buffer = new Uint8Array([...this._buffer, ...new Uint8Array(selectorBuffer._occupiedLength)]);
			this._byteLength += selectorBuffer._occupiedLength;
		}

		var posForEntry = this.entryList.length * this.itemSize;
		this.entryList.push(entryName);
		this._buffer.set(selectorBuffer._buffer, posForEntry);
	}
	/**
	 * @param {CSSSelectorsList} selectorsList
	 */
	populateFromSelectorsList(selectorsList : CSSSelectorsList) {
		var substrDef,
			bufferUIDforList = generatorFor16bitsInt.newUID();
		//	console.log(bufferUIDforList);
		selectorsList.forEach((selector) => {
			// TAKE CARE OF PERF: Our fail-fast strategy: we optimized the String.prototype.getNCharAsCharCodes method to get 3 chars most of the time,
			// 		and then we only match on the first char.
			// We're matching insensitive to case: eg https://www.w3.org/TR/2011/REC-CSS2-20110607/syndata.html#characters
			// 		=> "All CSS syntax is case-insensitive within the ASCII range."
			// (selector.rightMost.toLowerCase().getNcharsAsCharCodesArray(3, 4);)
			//		console.log(selector.rightMostHasPseudoClassFlag);
			substrDef = getNcharsAsCharCodesArray(selector.rightMost.toLowerCase(), 3, 4);
			this.addEntryFromBuffer(
				selector.selectorStr,
				this.getCompactedViewOnSelector(
					substrDef,
					selector.selectorProofingPartType,
					bufferUIDforList,
					selector.rightMostHasPseudoClassFlag,
					selector.rightMostPseudoClassType
				));
		});
	}
	/**
	 * @param {[number, number[]]} substrDef
	 * @param {number} proofingPartType
	 * @param {number[]} bufferUIDforList
	 * @param {number} hasPseudoClass
	 * @param {number} pseudoClassType
	 * @returns {MemorySingleBuffer<any>}
	 */
	getCompactedViewOnSelector(
		substrDef : [number, number[]],
		proofingPartType : number,
		bufferUIDforList : number[],
		hasPseudoClass : number,
		pseudoClassType : number
	) {
		var buffer = new MemorySingleBuffer<typeof schemaProps, typeof CSSSelectorsList.selectorAsBufferSchema>(CSSSelectorsList.selectorAsBufferSchema);
		// 16 bits values have to be declared as byte-tuples ([1, 0] would then represent 1, as all CPU's are now little-endian) 
		// (GeneratorFor16bitsInt, responsible for the UID, shall return an array)
		// Offset of the extracted string from the original string
		buffer.set(
			[substrDef[0]],
			CSSSelectorsList.selectorAsBufferSchema.startingOffsetInString.start
		);
		// Length of the extracted string from the original string
		buffer.set(
			[substrDef[1].length],
			CSSSelectorsList.selectorAsBufferSchema.stringLength.start
		);
		// Inject the most specific selector (specificity priority is: !important -> "style" DOM attr as a rule -> ID -> class/attribute/prop/pseudo-class -> nodeType/pseudo-elem)
		buffer.set(
			substrDef[1],
			CSSSelectorsList.selectorAsBufferSchema.stringBinaryEncoded.start
		);
		// ProofingPartType
		buffer.set(
			[proofingPartType],
			CSSSelectorsList.selectorAsBufferSchema.selectorProofingPartType.start
		);
		// hasPseudoClass
		buffer.set(
			[hasPseudoClass],
			CSSSelectorsList.selectorAsBufferSchema.selectorHasPseudoClass.start
		);
		// pseudoClassType
		buffer.set(
			[pseudoClassType],
			CSSSelectorsList.selectorAsBufferSchema.selectorPseudoClassType.start
		);
		// bufferUIDforList
		buffer.set(
			bufferUIDforList,
			CSSSelectorsList.selectorAsBufferSchema.bufferUID.start
		);
		//	console.log(buffer);
		return buffer;
	}
}








export default CSSSelectorSetBuffer;