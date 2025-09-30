/**
 * @module CSSSelectorSetBuffer
 */


import CSSSelectorsList from '.editing/CSSSelectorsList.js';
import MemoryMapBuffer from '../buffer/MemoryMapBuffer.js';
import MemorySingleBuffer from '../buffer/MemorySingleBuffer.js';
import {GeneratorFor16bitsInt} from '../UIDGenerator.js';


/**
 * Manages a set of compacted CSS selectors backed by a memory map buffer.
 *
 * Extends MemoryMapBuffer; stores entries in a single large buffer.
 * Builds from a CSSSelectorsList via populateFromSelectorsList.
 */
class CSSSelectorSetBuffer extends MemoryMapBuffer {
	static objectType = 'CSSSelectorSetBuffer';
	/**
	 * @param {Uint8Array} initialContent
	 * @param {CSSSelectorsList} selectorsList
	 */
	constructor(initialContent, selectorsList) {
		super(CSSSelectorsList.prototype.optimizedSelectorBufferSchema.size, initialContent);
		this.itemSize = CSSSelectorsList.prototype.optimizedSelectorBufferSchema.size;
		this.objectType = 'CSSSelectorSetBuffer';
		this._byteLength = 0;

		this.entryList = [];

		if (selectorsList)
			this.populateFromSelectorsList(selectorsList);
	}
	/**
	 * @param {string} entryName
	 * @returns {number}
	 */
	getPosForEntry(entryName) {
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
	getEntryForPos(pos) {
		return this.entryList[pos];
	}
	/**
	 * @param {string} entryName
	 * @returns {MemorySingleBuffer}
	 */
	getEntry(entryName) {
		var posForEntry = this.getPosForEntry(entryName) * this.itemSize;
		//	console.log(entryName, posForEntry, this._buffer, this._buffer.slice(posForEntry, posForEntry + this.itemSize));
		if (posForEntry < 0)
			return new MemorySingleBuffer(CSSSelectorsList.prototype.optimizedSelectorBufferSchema);

		var propAsBuffer = new MemorySingleBuffer(
			CSSSelectorsList.prototype.optimizedSelectorBufferSchema,
			this._buffer.slice(posForEntry, posForEntry + this.itemSize)
		);
		return propAsBuffer;
	}
	/**
	 * @param {string} entryName
	 * @param {MemorySingleBuffer} selectorBuffer
	 */
	addEntryFromBuffer(entryName, selectorBuffer) {
		if (this._byteLength + selectorBuffer._byteLength > this._buffer.byteLength) {
			this._buffer = new Uint8Array(this._buffer.buffer.append(new ArrayBuffer(selectorBuffer._byteLength)));
			this._byteLength += selectorBuffer._byteLength;
		}

		var posForEntry = this.entryList.length * this.itemSize;
		this.entryList.push(entryName);
		this._buffer.set(selectorBuffer._buffer, posForEntry);
	}
	/**
	 * @param {CSSSelectorsList} selectorsList
	 */
	populateFromSelectorsList(selectorsList) {
		var substrDef, bufferUIDforList = GeneratorFor16bitsInt.newUID();
		//	console.log(bufferUIDforList);
		selectorsList.forEach(function (selector) {
			// TAKE CARE OF PERF: Our fail-fast strategy: we optimized the String.prototype.getNCharAsCharCodes method to get 3 chars most of the time,
			// 		and then we only match on the first char.
			// We're matching insensitive to case: eg https://www.w3.org/TR/2011/REC-CSS2-20110607/syndata.html#characters
			// 		=> "All CSS syntax is case-insensitive within the ASCII range."
			// (selector.rightMost.toLowerCase().getNcharsAsCharCodesArray(3, 4);)
			//		console.log(selector.rightMostHasPseudoClassFlag);
			substrDef = selector.rightMost.toLowerCase().getNcharsAsCharCodesArray(3, 4);
			this.addEntryFromBuffer(
				selector.selectorStr,
				this.getCompactedViewOnSelector(
					substrDef,
					selector.selectorProofingPartType,
					bufferUIDforList,
					selector.rightMostHasPseudoClassFlag,
					selector.rightMostPseudoClassType
				));
		}, this);
	}
	/**
	 * @param {Array<number>} substrDef
	 * @param {number} proofingPartType
	 * @param {number} bufferUIDforList
	 * @param {number} hasPseudoClass
	 * @param {number} pseudoClassType
	 * @returns {MemorySingleBuffer}
	 */
	getCompactedViewOnSelector(substrDef, proofingPartType, bufferUIDforList, hasPseudoClass, pseudoClassType) {
		var buffer = new MemorySingleBuffer(CSSSelectorsList.prototype.optimizedSelectorBufferSchema);
		// 16 bits values have to be declared as byte-tuples ([1, 0] would then represent 1, as all CPU's are now little-endian) 
		// (GeneratorFor16bitsInt, responsible for the UID, shall return an array)
		// Offset of the extracted string from the original string
		buffer.set(
			[substrDef[0]],
			CSSSelectorsList.prototype.optimizedSelectorBufferSchema.startingOffsetInString.start
		);
		// Length of the extracted string from the original string
		buffer.set(
			[substrDef[1].length],
			CSSSelectorsList.prototype.optimizedSelectorBufferSchema.stringLength.start
		);
		// Inject the most specific selector (specificity priority is: !important -> "style" DOM attr as a rule -> ID -> class/attribute/prop/pseudo-class -> nodeType/pseudo-elem)
		buffer.set(
			substrDef[1],
			CSSSelectorsList.prototype.optimizedSelectorBufferSchema.stringBinaryEncoded.start
		);
		// ProofingPartType
		buffer.set(
			[proofingPartType],
			CSSSelectorsList.prototype.optimizedSelectorBufferSchema.selectorProofingPartType.start
		);
		// hasPseudoClass
		buffer.set(
			[hasPseudoClass],
			CSSSelectorsList.prototype.optimizedSelectorBufferSchema.selectorHasPseudoClass.start
		);
		// pseudoClassType
		buffer.set(
			[pseudoClassType],
			CSSSelectorsList.prototype.optimizedSelectorBufferSchema.selectorPseudoClassType.start
		);
		// bufferUIDforList
		buffer.set(
			bufferUIDforList,
			CSSSelectorsList.prototype.optimizedSelectorBufferSchema.bufferUID.start
		);
		//	console.log(buffer);
		return buffer;
	}
}








export default CSSSelectorSetBuffer;