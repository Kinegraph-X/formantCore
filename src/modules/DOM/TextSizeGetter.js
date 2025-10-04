/**
 * @constructor TextSizeGetter
 * 
*/

import {defUIDGenerator} from '../UIDGenerator.js';
import NodeResizeObserver from './ResizeObserver'


class TextSizeGetter {
	static objectType = 'TextSizeGetter';
	resizeObserver = new NodeResizeObserver();
	sampleNode = document.createElement('span');
	/**
	 * @param {string} fontStyle 
	 * @returns 
	 */
	constructor(fontStyle) {
		if (typeof document === 'undefined' || typeof document.ownerDocument === 'undefined')
			return;

		// width calculation
		this.initCb;
		this.textWidthCanvas = document.createElement("canvas");
		this.textWidthCanvasCtx = this.textWidthCanvas.getContext('2d');
		if (!this.textWidthCanvasCtx)
			throw new Error('unsupported canvas type in this browser');
		this.fontStyle = fontStyle;
		this.textWidthCanvasCtx.font = this.fontStyle;
		this.lineHeight = 0;
	}
	/**
	 * 
	 * @param {HTMLElement} sampleNode 
	 * @param {function} cb 
	 */
	init(sampleNode, cb) {
		this.sampleNode = sampleNode;
		this.initCb = cb;
		this.resizeObserver.observe(sampleNode, this.initWidthCompute.bind(this));
	}
	/**
	 * @param {HTMLElement} sampleNode 
	 * @param {function} cb 
	 */
	oneShot(sampleNode, cb) {
		sampleNode.id = sampleNode.id + '-asStyleSource-' + defUIDGenerator.newUID();
		this.resizeObserver.observe(sampleNode, this.onOneShot.bind(this, sampleNode, cb));
	}
	/**
	 * @param {HTMLElement} sampleNode 
	 * @param {function} cb 
	 */
	onOneShot(sampleNode, cb) {
		var style = window.getComputedStyle(sampleNode);
		sampleNode.id = sampleNode.id.replace(/-asStyleSource-\d+/, '');
		if (!sampleNode.id)
			sampleNode.removeAttribute('id');
		if (cb)
			cb(style);
	}
	/**
	 * @param {FrameworkEvent} e 
	 */
	initWidthCompute(e) {
		var self = this;

		var style = window.getComputedStyle(this.sampleNode);
		this.fontStyle = style.fontSize + ' ' + style.fontFamily;

		this.lineHeight = Number(style.lineHeight.slice(0, -2));

		this.textWidthCanvasCtx.font = this.fontStyle;

		if (e.data.boundingBox.h > 0) {
			if (this.initCb)
				this.initCb(this.fontStyle);
			this.resizeObserver.unobserve(this.sampleNode);
			this.initCb = undefined;
		}
	}
	/**
	 * @param {string} str 
	 * @returns 
	 */
	getTextWidth(str) {
		if (typeof str === 'undefined')
			return;
		return this.textWidthCanvasCtx.measureText(str).width;
	}
	/**
	 * 
	 * @param {string} str 
	 * @param {string} fontStyle 
	 * @returns 
	 */
	getTextSizeDependingOnStyle(str, fontStyle) {
		if (typeof str === 'undefined')
			return;
		if (fontStyle)
			this.textWidthCanvasCtx.font = fontStyle;

		var textSize = this.textWidthCanvasCtx.measureText(str);

		return [
			textSize.width,
			textSize.actualBoundingBoxAscent + textSize.actualBoundingBoxDescent
		];
	}
}







export default TextSizeGetter;