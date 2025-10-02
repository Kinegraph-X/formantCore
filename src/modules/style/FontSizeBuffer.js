/**
 * construct. FontSizeBuffer
 */

import TextSizeGetter from '../DOM/TextSizeGetter.js';


class FontSizeBuffer {
	static objectType = 'FontSizeBuffer';
	/**
	 * @param {string} fontSize
	 * @param {string} fontFamily
	 */
	constructor(fontSize, fontFamily) {
		this._buffer = new Float64Array(new ArrayBuffer(341 * 8));
		this.objectType = 'FontSizeBuffer';
		
		// For now, we assume we won't have to fall back on the second typeface of the family
		this.fontStyle = fontSize + ' ' + fontFamily.split(',')[0];
		this.textSizeGetter = new TextSizeGetter(this.fontStyle);
		
		if (this.fontStyle)
			this.populateInitialValues();
	}

	populateInitialValues() {
		// We need to cache values until 340 tio catch "oe"
		for (var i = 32, l = 340; i < l; i++) {
	//		console.log(i, String.fromCharCode(i), this.textSizeGetter.getTextWidth(String.fromCharCode(i)))
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
		var width = 0;
		for (var i = 0, l = str.length; i < l; i++) {
			width += this._buffer.at(str.charCodeAt(i));
		}
		return width;
	}
}

export default FontSizeBuffer;