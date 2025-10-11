/**
 * construct. FontSizeBuffer
 */

import TextSizeGetter from '../DOM/TextSizeGetter.js';


class FontSizeBuffer {
	static objectType = 'FontSizeBuffer';
	// We need to cache values until 340 to catch "oe"
	static maxCharCode = 340;
	/**
	 * @param {string} fontSize
	 * @param {string} fontFamily
	 */
	constructor(fontSize, fontFamily) {
		this._buffer = new Float64Array(new ArrayBuffer(FontSizeBuffer.maxCharCode + 1 * 8));
		this.objectType = 'FontSizeBuffer';
		
		// For now, we assume we won't have to fall back on the second typeface of the family
		this.fontStyle = fontSize + ' ' + fontFamily.split(',')[0];
		this.textSizeGetter = new TextSizeGetter(this.fontStyle);
		
		if (this.fontStyle)
			this.populateInitialValues();
	}

	populateInitialValues() {
		// We need to cache values until 340 to catch "oe"
		for (var i = 32, l = FontSizeBuffer.maxCharCode; i < l; i++) {
			this._buffer.set([this.textSizeGetter.getTextWidth(String.fromCharCode(i))], i);
		}
	}

	getWidthOfSpace() {
		return this._buffer.at(32);
	}
	/**
	 * 
	 * @param {string} str 
	 * @returns 
	 */
	getWidthOfWord(str) {
		let width = 0,
			charCode;
		for (var i = 0, l = str.length; i < l; i++) {
			charCode = str.charCodeAt(i);
			if (charCode >= 340 || !this._buffer.at(charCode))
				throw new Error('FontSizeBuffer: unknown charCode accessed for size. Code is ' + charCode);

			/** @ts-ignore possibly undefined: tested above */
			width += this._buffer.at(charCode);
		}
		return width;
	}
}

export default FontSizeBuffer;