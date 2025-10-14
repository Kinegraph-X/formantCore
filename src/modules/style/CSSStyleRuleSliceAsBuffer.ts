

import MemoryMapBuffer from '../buffer/MemoryMapBuffer.js';
import registries from '../Registries.js';
import CSSPropertyAsBuffer from './CSSPropertyAsBuffer.js';
import {
	CSSCategory,
	bufferBoundaries,
	splittedCSSPropertyDescriptors,
	inheritedCSSPropertyKeys,
	allCSSPropertyKeys,
	type CSSBoundary,
	CSSPropertyDescriptorFactory,
} from './CSSPropertyDescriptors.js';
import FontSizeBuffer from './FontSizeBuffer.js';

import {parseAListOfComponentValues} from '../../third-party/css-parser_forked_normalized.js';

import TextSizeGetter from '../DOM/TextSizeGetter.js';
const textSizeGetter = new TextSizeGetter();

// @ts-noCheck

/**
 * Manages CSS property values in a compact binary format for efficient style processing.
 *
 * It serves as a buffer-based container for a fixed set of CSS properties 
 * belonging to a specific category (e.g., inherited or non-inherited styles), 
 * enabling high-performance manipulation of style rules 
 * by minimizing object allocation and leveraging typed arrays.
 * 
 * Key methods :
 * getProp(propName) -> Returns a CSSPropertyAsBuffer instance backed by a slice of the internal buffer
 * setPropFromBuffer(propName, propBuffer) -> Sets a property value from a CSSPropertyAsBuffer instance
 * setPropFromShorthand(propName, value) -> Sets a property value from a shorthand value
 */
class CSSStyleRuleSliceAsBuffer<T extends readonly any[]> extends MemoryMapBuffer {
	static objectType = 'CSSPropertySetBuffer';
	static cachedCSSPropertyAsBuffer = new CSSPropertyAsBuffer(null, '');
	static STYLE_SET = new Set(['none','hidden','dotted','dashed','solid','double','groove','ridge','inset','outset']);
	static REPEAT_SET = new Set(['repeat','repeat-x','repeat-y','no-repeat','space','round']);
	static ATTACH_SET = new Set(['scroll','fixed','local']);
	static BOX_SET = new Set(['border-box','padding-box','content-box']);
	static POS_IDENT = new Set(['left','right','center','top','bottom']);
	static FONT_STYLE_SET = new Set(['normal','italic','oblique']);
	static VARIANT_SET = new Set(['normal','small-caps']);
	static WEIGHT_SET = new Set(['normal','bold','bolder','lighter','100','200','300','400','500','600','700','800','900']);
	static STRETCH_SET = new Set(['normal','ultra-condensed','extra-condensed','condensed','semi-condensed','semi-expanded','expanded','extra-expanded','ultra-expanded']);
	category = null;
	propertiesStaticArray;
	propertiesAccessGroupsBoundaries;
	

	 /**
	 * This Factory is the only way to build a CSSPropertySetBuffer.
     * Create a buffer initialized only for a given CSS property category.
     * Category must be one of the keys in splittedCSSPropertyDescriptors.
     * 
     * @returns {CSSStyleRuleSliceAsBuffer}
     */
	static fromCategory<
	 T extends Record<string, ReturnType<typeof CSSPropertyDescriptorFactory>>,
	 K extends readonly any[]
	>(
		map : T,
		keys : K,
		boundaries : CSSBoundary,
		initialContent : Uint8Array|null = null
	) {
		if (!initialContent) {
			const itemSize = CSSPropertyAsBuffer.bufferSchema.size;
			initialContent = new Uint8Array(Object.keys(map).length * itemSize);
			let offset = 0;

			for (const descName in map) {
				const initialValue = map[descName].initialValue;
				const packed = new CSSPropertyAsBuffer(null, descName);
				packed.setValue(initialValue.toString());
				initialContent.set(packed._buffer, offset);
				// mark as initial value
				initialContent.set([1], offset + CSSPropertyAsBuffer.bufferSchema.isInitialValue.start);
				offset += itemSize;
			}
		}

        const inst = new CSSStyleRuleSliceAsBuffer<K>(initialContent, keys, boundaries);
        return inst;
    }

	static propertiesStaticArray = inheritedCSSPropertyKeys;

	/**
	 * @constructor CSSPropertySetBuffer
	 * @param {Uint8Array} initialContent
	 */
	constructor(
		initialContent: Uint8Array,
		propertiesArray : T,
		boundaries : CSSBoundary
	) {
		super(CSSPropertyAsBuffer.bufferSchema.size, initialContent.byteLength / CSSPropertyAsBuffer.bufferSchema.size);

		this._buffer.set(
			initialContent
		);

		this.propertiesStaticArray = propertiesArray;
		this.propertiesAccessGroupsBoundaries = boundaries;
	}
	/**
	 * returns the index of a property in the static property list.
	 *
	 * Looks up by name in this.propertiesStaticArray.
	 * Returns -1 if not found.
	 * Used by getProp, setPropFromBuffer, and fast accessors.
	 *
	 * @param {string} propName
	 * @returns {number}
	 */
	getPosForProp(propName: string) {
		var propIdx = 0;

		if ((propIdx = this.propertiesStaticArray.indexOf(propName)) !== -1) {
			return propIdx;
		}
		return -1;
	}
	/**
	 * @param {number} pos
	 * @returns {string}
	 */
	getPropForPos(pos: number) {
		return this.propertiesStaticArray[pos];
	}
	/**
	 * @param {string} propName
	 * @returns {CSSPropertyAsBuffer}
	 */
	getProp(propName: string) {
		var posForProp = this.getPosForProp(propName) * this.itemSize;
		var propAsBuffer = new CSSPropertyAsBuffer(
			this._buffer.slice(posForProp, posForProp + this.itemSize),
			propName
		);
		return propAsBuffer;
	}
	/**
	 * @param {string} propName
	 * @param {CSSPropertyAsBuffer} propBuffer
	 */
	setPropFromBuffer(propName: string, propBuffer: CSSPropertyAsBuffer) {
		var resolvedPropName = propName,
			posForProp;

		if (allCSSPropertyDescriptors[resolvedPropName].isAlias)
			resolvedPropName = allCSSPropertyDescriptors[resolvedPropName].expandedPropNames[0];
		
		// abbreviated are handled in setPropFromShorthand()
		if (allCSSPropertyDescriptors[resolvedPropName].isShorthand) {
			this.setPropFromShorthand(resolvedPropName, propBuffer.getValueAsString());
			return;
		}
		
		// Direct write for longhands
		if ((posForProp = this.getPosForProp(resolvedPropName) * this.itemSize) < 0)
			return;

		this._buffer.set(propBuffer._buffer, posForProp);
	}
	/**
	 * Sets a property from a shorthand value
	 * Distinguishes between abbreviated and multiple-type shorthands
	 * (optimization to avoid parsing when the case is simple)
	 * 
	 * @see CSSStyleRuleSliceAsBuffer.setValuesFromShorthand()
	 * 
	 * @param {string} propName
	 * @param {string} value
	 */
	setPropFromShorthand(propName: string, value: string) {

		if (allCSSPropertyDescriptors[propName].mayBeAbbreviated) {
			this.handleAbbreviatedValues(propName, value);
			return;
		}

		// setValuesFromShorthand will call the right classifier depending on the prop type
		// (e.g. background is "ident url ident ident ident" in any order,
		// border is "ident thin|medium|thick/dimension hash/function/colorIdent" in any order)
		// and return the values in the right order
		this.setValuesFromShorthand(propName, value);
	}
	/**
	 * Parses and assigns CSS shorthand values,
	 * calls the right classifier depending on the prop type
	 * and assigns them to the corresponding longhand properties (like borderWidth, borderStyle, and borderColor)
	 * based on token type and the CSS specification
	 * 
	 * @see CSSPropertyAsBuffer.setFromParsedToken()
	 * 
	 * @param {string} propName
	 * @param {string} value
	 * @returns 
	 */
	setValuesFromShorthand(propName: string, value: string) {
		const tokens = parseAListOfComponentValues(value);
		const vals = tokens.filter(t => t.tokenType !== 'WHITESPACE' && t.tokenType !== 'COMMA');
		
		if (propName === 'border') {
			this.setValueFromBorderShorthand(vals);
			return [];
		}
		// Background shorthand (single layer)
		if (propName === 'background') {
			this.setValueFromBackgroundShorthand(vals);
			return [];
		}
		if (propName === 'font') {
			this.setValueFromFontShorthand(vals);
			return [];
		}
		if (propName === 'backgroundPosition') {
			this.setValueFromBackgroundPositionShorthand(vals);
			return [];
		}
		if (propName === 'backgroundSize') {	// not a real shorthand, see implementation
			this.setValueFromBackgroundSizeShorthand(vals);
			return [];
		}

		return value.match(/[a-zA-Z0-9#\/:.,%-]+/g) || [];
	}
	/**
	 * Border shorthand: width, style, color
	 * @param {unknown[]} vals Array of tokens from the parser
	 */
	setValueFromBorderShorthand(vals: unknown[]) {
		// buckets
		let widthTok = null, styleTok = null, colorTok = null;
		for (const t of vals) {
			if (!styleTok && t.tokenType === 'IDENT' && CSSStyleRuleSliceAsBuffer.STYLE_SET.has(t.repr)) { styleTok = t; continue; }
			if (!colorTok && (t.tokenType === 'HASH' || t.tokenType === 'FUNCTION' || (t.tokenType === 'IDENT' && t.repr !== 'auto'))) { colorTok = t; continue; }
			if (!widthTok) { widthTok = t; continue; }
		}
		const map = [widthTok, styleTok, colorTok];
		const longs = allCSSPropertyDescriptors[propName].expandedPropNames; // e.g., [borderWidth, borderStyle, borderColor]
		const tmp = CSSStyleRuleSliceAsBuffer.cachedCSSPropertyAsBuffer;
		for (let i = 0; i < longs.length; i++) {
			tmp.setProp(longs[i]);
			tmp.setFromParsedToken(map[i]);
			this.setPropFromBuffer(longs[i], tmp);
		}
	}
	/**
	 * Background shorthand: image, position [/ size], repeat, attachment, origin, clip, color (single layer)
	 * 
	 * These are single-layer handlers for background. If you need multiple layers (comma-separated), iterate layers split by top-level commas and apply per-layer longhands or serialize back to layer lists.
	 * For background-position, supporting keywords + lengths should be sufficient. If you need the 3–4 value modern syntax (with slash for axes), extend similarly to the size logic.
	 * For font, the parsing is heuristic and covers the common cases; the CSS Fonts spec has many corner cases.
	 * 
	 * @param {unknown[]} vals tokens (no whitespace/commas)
	 */
	setValueFromBackgroundShorthand(vals: unknown[]) {
		const tmp = CSSStyleRuleSliceAsBuffer.cachedCSSPropertyAsBuffer;
		const longs = allCSSPropertyDescriptors.background?.expandedPropNames || [];
	
		// buckets
		let imageTok = null, colorTok = null, repeatTok = null, attachmentTok = null;
		let originTok = null, clipTok = null;
		let positionTokens = [], sizeTokens = [];
		let seenSlash = false;
	
		for (const t of vals) {
			if (t.tokenType === 'DELIM' && (t.value === '/' || t.repr === '/')) { seenSlash = true; continue; }
			if (!imageTok && ((t.tokenType === 'FUNCTION' && t.name === 'url') || (t.tokenType === 'IDENT' && t.repr === 'none'))) { imageTok = t; continue; }
			if (!repeatTok && t.tokenType === 'IDENT' && CSSStyleRuleSliceAsBuffer.REPEAT_SET.has(t.repr)) { repeatTok = t; continue; }
			if (!attachmentTok && t.tokenType === 'IDENT' && CSSStyleRuleSliceAsBuffer.ATTACH_SET.has(t.repr)) { attachmentTok = t; continue; }
			if (!originTok && t.tokenType === 'IDENT' && CSSStyleRuleSliceAsBuffer.BOX_SET.has(t.repr)) { originTok = t; continue; }
			if (!clipTok && t.tokenType === 'IDENT' && CSSStyleRuleSliceAsBuffer.BOX_SET.has(t.repr)) { clipTok = t; continue; }
			if (!colorTok && (t.tokenType === 'HASH' || t.tokenType === 'FUNCTION' || (t.tokenType === 'IDENT'))) { colorTok = t; continue; }
		
			if (!seenSlash) {
				if (t.tokenType === 'DIMENSION' || t.tokenType === 'PERCENTAGE' || (t.tokenType === 'IDENT' && CSSStyleRuleSliceAsBuffer.POS_IDENT.has(t.repr))) positionTokens.push(t);
			} else {
				if (t.tokenType === 'DIMENSION' || t.tokenType === 'PERCENTAGE' || (t.tokenType === 'IDENT' && (t.repr === 'auto' || t.repr === 'cover' || t.repr === 'contain'))) sizeTokens.push(t);
			}
		}
	
		const setTok = (propName: string, tokOrString: unknown) => {
			if (!propName || tokOrString == null) return;
			tmp.setProp(propName);
			if (typeof tokOrString === 'string') 
				tmp.setValue(tokOrString);
			else 
				tmp.setFromParsedToken(tokOrString);
			this.setPropFromBuffer(propName, tmp);
		};
		const find = (name: string) => longs.find(l => l.toLowerCase().includes(name));
	
		setTok(find('image'), imageTok);
		if (positionTokens.length) {
			setTok(find('position'), positionTokens.map(t => t.repr || t.value).join(' '));
			this.setValueFromBackgroundPositionShorthand(positionTokens);
		}
		if (sizeTokens.length) {
			setTok(find('size'), sizeTokens.map(t => t.repr || t.value).join(' '));
			this.setValueFromBackgroundSizeShorthand(sizeTokens);
		}
		setTok(find('repeat'), repeatTok);
		setTok(find('attachment'), attachmentTok);
	
		// origin / clip share tokens when only one box is given
		if (originTok && !clipTok) clipTok = originTok;
		setTok(find('origin'), originTok);
		setTok(find('clip'), clipTok);
	
		setTok(find('color'), colorTok);
	}

	/**
	 * background-position: <position-x> <position-y>?
	 * Maps to our longhands: backgroundPositionLeft (x), backgroundPositionTop (y)
	 * Heuristic:
	 * - If 2 tokens => first is x, second is y.
	 * - If 1 token:
	 *    - If token in {top,bottom,center} => y=token, x='center'
	 *    - Else => x=token, y='center'
	 */
	setValueFromBackgroundPositionShorthand(vals: unknown[]) {
		const tmp = CSSStyleRuleSliceAsBuffer.cachedCSSPropertyAsBuffer;
		const longs = (allCSSPropertyDescriptors.backgroundPosition?.expandedPropNames) || [];
		const findLeft = () => longs.find(l => l.toLowerCase().includes('X'));
		const findTop  = () => longs.find(l => l.toLowerCase().includes('Y'));
	
		// Accept idents in POS_IDENT and numeric dimensions/percentages
		const posTokens = vals.filter(t =>
		t.tokenType === 'DIMENSION' ||
		t.tokenType === 'PERCENTAGE' ||
		(t.tokenType === 'IDENT' && CSSStyleRuleSliceAsBuffer.POS_IDENT.has(t.repr))
		);
	
		let xTok = null, yTok = null;
	
		if (posTokens.length >= 2) {
		[xTok, yTok] = posTokens;
		} else if (posTokens.length === 1) {
		const t = posTokens[0];
		const isY = t.tokenType === 'IDENT' && (t.repr === 'top' || t.repr === 'bottom' || t.repr === 'center');
		if (isY) {
			yTok = t;
			xTok = { tokenType: 'IDENT', repr: 'center' };
		} else {
			xTok = t;
			yTok = { tokenType: 'IDENT', repr: 'center' };
		}
		} else {
		// No tokens: default to initial
		xTok = { tokenType: 'PERCENTAGE', repr: '0%', value: 0 };
		yTok = { tokenType: 'PERCENTAGE', repr: '0%', value: 0 };
		}
	
		const leftName = findLeft();
		const topName = findTop();
		if (leftName) {
		tmp.setProp(leftName);
		tmp.setFromParsedToken(xTok);
		this.setPropFromBuffer(leftName, tmp);
		}
		if (topName) {
		tmp.setProp(topName);
		tmp.setFromParsedToken(yTok);
		this.setPropFromBuffer(topName, tmp);
		}
	}
  
	/**
	 * background-size is not a real shorthand, but let's resolve with "value auto" as default
	 * "auto auto" is already the initialValue
	 * background-size: <auto> | <cover> | <contain> | <width> <height>?
	 * Our descriptors have no expanded longhands; set the single longhand value.
	 * Heuristic:
	 * - If 2 tokens => join with space.
	 * - If 1 token => append ' auto' unless keyword cover/contain already complete.
	 */
	setValueFromBackgroundSizeShorthand(vals: unknown[]) {
		const tmp = CSSStyleRuleSliceAsBuffer.cachedCSSPropertyAsBuffer;
	
		const sizeTokens = vals.filter(t =>
			t.tokenType === 'DIMENSION' ||
			t.tokenType === 'PERCENTAGE' ||
			(t.tokenType === 'IDENT' && (t.repr === 'auto' || t.repr === 'cover' || t.repr === 'contain'))
		);
	
		let out;
		if (sizeTokens.length >= 2) {
			out = sizeTokens.slice(0, 2).map(t => t.repr ?? String(t.value)).join(' ');
		} 
		else if (sizeTokens.length === 1) {
			const t = sizeTokens[0];
			if (t.tokenType === 'IDENT' && (t.repr === 'cover' || t.repr === 'contain')) {
				out = t.repr;
			} else {
				out = (t.repr ?? String(t.value)) + ' auto';
		}
		} else {
			out = 'auto auto';
		}
	
		tmp.setProp('backgroundSize');
		tmp.setValue(out);
		this.setPropFromBuffer('backgroundSize', tmp);
	}

	/**
	 * font shorthand: [style? variant? weight? stretch?] size [/ line-height]? family
	 * Commented lines are properties we don't yet support
	 * @param {unknown[]} tokens full tokens (may include whitespace)
	 */
	setValueFromFontShorthand(tokens: unknown[]) {
		const tmp = CSSStyleRuleSliceAsBuffer.cachedCSSPropertyAsBuffer;
		const longs = allCSSPropertyDescriptors.font?.expandedPropNames || [];
		
		// buckets
		let styleTok=null, variantTok=null, weightTok=null, stretchTok=null, sizeTok=null, lineTok=null;
		let slashSeen = false;
		let familyTokens = [];
	
		for (const t of tokens) {
			if (!styleTok && t.tokenType === 'IDENT' && CSSStyleRuleSliceAsBuffer.FONT_STYLE_SET.has(t.repr)) { styleTok = t; continue; }
			// if (!variantTok && t.tokenType === 'IDENT' && CSSStyleRuleSliceAsBuffer.VARIANT_SET.has(t.repr)) { variantTok = t; continue; }
			if (!weightTok && ((t.tokenType === 'IDENT' && CSSStyleRuleSliceAsBuffer.WEIGHT_SET.has(t.repr)) || t.tokenType === 'NUMBER')) { weightTok = t; continue; }
			// if (!stretchTok && t.tokenType === 'IDENT' && CSSStyleRuleSliceAsBuffer.STRETCH_SET.has(t.repr)) { stretchTok = t; continue; }
		
			if (!sizeTok && (t.tokenType === 'DIMENSION' || (t.tokenType === 'IDENT' && /^(xx-small|x-small|small|medium|large|x-large|xx-large|xxx-large|smaller|larger)$/i.test(t.repr)))) {
				sizeTok = t; continue;
			}
		
			if (t.tokenType === 'DELIM' && (t.value === '/' || t.repr === '/')) { slashSeen = true; continue; }
			// if (sizeTok && !lineTok && slashSeen) { lineTok = t; continue; }
		
			if (sizeTok && (!slashSeen || (slashSeen && lineTok))) familyTokens.push(t);
		}
	
		const setTok = (propName: string, tokOrString: unknown) => {
			if (!propName || tokOrString == null) return;
			tmp.setProp(propName);
			if (typeof tokOrString === 'string') 
				tmp.setValue(tokOrString);
			else 
				tmp.setFromParsedToken(tokOrString);
			this.setPropFromBuffer(propName, tmp);
		};
		const find = (name: string) => longs.find(l => l.toLowerCase().includes(name));
	
		setTok(find('style'), styleTok);
		// setTok(find('variant'), variantTok);
		setTok(find('weight'), weightTok);
		// setTok(find('stretch'), stretchTok);
		setTok(find('size'), sizeTok);
		// setTok(find('line'), lineTok);
	
		if (familyTokens.length) {
			const family = familyTokens.map(t => t.repr || (t.value?.toString() ?? '')).join(' ');
			setTok(find('family'), family);
		}
	}

	/**
	 * Abbreviated values are handled without parsing, for performance reasons.
	 * We just split the string and evaluate the 1-4 values.
	 * @param {string} propName
	 * @param {string} value
	 */
	handleAbbreviatedValues(propName: string, value: string) {
		const valueList = value.split(' '), 
			tmpBuffer = CSSStyleRuleSliceAsBuffer.cachedCSSPropertyAsBuffer,
			vals = valueList.filter(t => t.tokenType !== 'WHITESPACE' && t.tokenType !== 'COMMA');

		if (valueList.length === 1) {
			allCSSPropertyDescriptors[propName].expandedPropNames.forEach((expandedPropertyName, key) => {
				tmpBuffer.setProp(expandedPropertyName);
				tmpBuffer.setValue(valueList[0]);
				this.setPropFromBuffer(expandedPropertyName, tmpBuffer);
			});
		}
		else if (valueList.length === 2) { // the property includes 1 whitespace
			allCSSPropertyDescriptors[propName].expandedPropNames.forEach((expandedPropertyName, key) => {
				tmpBuffer.setProp(expandedPropertyName);
				if (key === 0 || key === 2)
					tmpBuffer.setValue(valueList[0]);

				else
					tmpBuffer.setValue(valueList[1]);
				this.setPropFromBuffer(expandedPropertyName, tmpBuffer);
			});
		}
		else if (valueList.length === 3) { // the property includes 2 whitespace
			allCSSPropertyDescriptors[propName].expandedPropNames.forEach((expandedPropertyName, key) => {
				tmpBuffer.setProp(expandedPropertyName);
				if (key !== 3)
					tmpBuffer.setValue(valueList[key]);

				else
					tmpBuffer.setValue(valueList[1]);
				this.setPropFromBuffer(expandedPropertyName, tmpBuffer);
			});
		}
		else if (valueList.length === 4) { // the property includes 3 whitespace
			allCSSPropertyDescriptors[propName].expandedPropNames.forEach((expandedPropertyName, key) => {
				tmpBuffer.setProp(expandedPropertyName);
				tmpBuffer.setValue(valueList[key]);
				this.setPropFromBuffer(expandedPropertyName, tmpBuffer);
			});
		}
	}
	/**
	 * @param {CSSPropertyAsBuffer} overridePropBuffer
	 * @param {boolean} isFontSizeProp
	 * @param {string} [originalPropName]
	 */
	setPropAfterResolvingCanonicalUnits(
		overridePropBuffer: CSSPropertyAsBuffer,
		isFontSizeProp: boolean,
	) {
		var propName = 'fontSize', fontSize = this.getPropAsNumber(propName);

		if (isFontSizeProp) {
			overridePropBuffer.setValue(
				String(
					Math.floor(fontSize * overridePropBuffer.getValueAsNumber() / 100)
				) + 'px'
			);
		}

		var fontFamily = this.getPropAsString('fontFamily'), fontStyle = fontSize + this.getUnitAsString(propName) + ' ' + fontFamily, sizeOfM = 0;

		switch (overridePropBuffer.getUnitAsString()) {
			case 'em':
				sizeOfM = this.getTextDimensions('M', fontStyle);
				//			console.log('NEW SIZE', overridePropBuffer.getValueAsNumber(), sizeOfM, fontStyle);
				overridePropBuffer.setValue(
					String(
						Math.floor(overridePropBuffer.getValueAsNumber() * sizeOfM)
					) + 'px'
				);
				break;
			default:
				break;
		}
	}
	/**
	 * @returns {Object<string, string>}
	 */
	getDefinedPropertiesAsAttributesList() {
		const initialValueIdx = CSSPropertyAsBuffer.bufferSchema.isInitialValue.start;
		let propName,
			 c = 0;

		let ret = {} as {[key: string]: string};

		for (var i = 0, end = i + this.propertiesStaticArray.length * this.itemSize; i < end; i += this.itemSize) {
			propName = this.propertiesStaticArray[c] as string;
			if (this._buffer[i + initialValueIdx] === 0) {
				ret[propName] = this.fastBufferedValueToString(propName);
			}
			c++;
		}

		return ret;
	}
	/**
	 * @param {string} groupName
	 * @returns {Object<string, CSSPropertyAsBuffer>}
	 */
	getPropertyGroupAsBufferMap(groupName: string) {
		var propName;
		var c = 0;
		var boundaries = this.propertiesAccessGroupsBoundaries;

		var ret = {} as {[key: string]: CSSPropertyAsBuffer};

		for (var i = boundaries.start * this.itemSize, end = i + boundaries.length * this.itemSize; i < end; i += this.itemSize) {
			propName = this.propertiesStaticArray[boundaries.start + c] as string;
			ret[propName] = (new CSSPropertyAsBuffer(
				this._buffer.slice(i, i + this.itemSize),
				propName
			));
			c++;
		}
		return ret;
	}
	/**
	 * @param {string} groupName
	 * @returns {Object<string, string>}
	 */
	getPropertyGroupAsAttributesList(groupName: string) {
		var propName;
		var c = 0;
		var boundaries = this.propertiesAccessGroupsBoundaries;

		var ret = {} as {[key: string]: string};

		for (var i = boundaries.start * this.itemSize, end = i + boundaries.length * this.itemSize; i < end; i += this.itemSize) {
			propName = this.propertiesStaticArray[boundaries.start + c] as string;
			ret[propName] = this.fastBufferedValueToString(propName);
			c++;
		}
		return ret;
	}
	/**
	 * @param {string} groupName
	 * @returns {Object<string, string>}
	 */
	getDefinedPropertiesFromGroupAsAttributesList(groupName: string) {
		let propName, c = 0;
		const boundaries = this.propertiesAccessGroupsBoundaries,
			initialValueIdx = CSSPropertyAsBuffer.bufferSchema.isInitialValue.start;

		var ret = {} as {[key: string]: string};
		for (var i = boundaries.start * this.itemSize, end = i + boundaries.length * this.itemSize; i < end; i += this.itemSize) {
			propName = this.propertiesStaticArray[boundaries.start + c]  as string;
			if (this._buffer[i + initialValueIdx] === 0)
				ret[propName] = this.fastBufferedValueToString(propName);
			c++;
		}
		return ret;
	}
	/**
	 * @param {string} groupName
	 * @returns {Array<number>}
	 */
	getPropertyGroupAsBuffer(groupName: string) {
		var boundaries = this.propertiesAccessGroupsBoundaries;
		var start = boundaries.start * this.itemSize, end = start + boundaries.length * this.itemSize;
		return this._buffer.slice(start, end);
	}
	/**
	 * @param {string} groupName
	 * @param {Array<number>} groupBuffer
	 */
	setPropertyGroupFromGroupBuffer(groupName: string, groupBuffer: number[]) {
		var boundaries = this.propertiesAccessGroupsBoundaries;
		var start = boundaries.start * this.itemSize;
		this._buffer.set(groupBuffer, start);
	}
	/**
	 * @param {string} groupName
	 * @param {Uint8Array} groupBuffer
	 * @param {boolean} setFromInherited
	 */
	overridePropertyGroupFromGroupBuffer(groupName: string, groupBuffer: Uint8Array, setFromInherited: boolean) {
		const inheritedAttributesStr = 'inheritedAttributes',
			fontSizeStr = 'fontSize',
			fontFamilyStr = 'fontFamily',
			boundaries = this.propertiesAccessGroupsBoundaries,
			tokenTypeIdx = CSSPropertyAsBuffer.bufferSchema.tokenType.start,
			isInitialValueIdx = CSSPropertyAsBuffer.bufferSchema.isInitialValue.start,
			reprIdx = CSSPropertyAsBuffer.bufferSchema.repr.start,
			dimensionTokenType = CSSPropertyAsBuffer.prototype.TokenTypes.DimensionToken,
			percentageTokenType = CSSPropertyAsBuffer.prototype.TokenTypes.PercentageToken;
		let c = 0, 
			isFontSizeProp = false,
			tmpPropertyBuffer, 
			fontFamily = '',
			fontSize = '';

		for (var i = boundaries.start * this.itemSize, end = i + boundaries.length * this.itemSize; i < end; i += this.itemSize) {
			isFontSizeProp = false;

			// Not optimized way to handle 'em' CSS units (they depend on the size of the letter "M" in the current font-style)
			// TODO: is there a way to optimize this ?
			// FIXME: 
			if (groupBuffer[c + tokenTypeIdx] === dimensionTokenType) {
				tmpPropertyBuffer = new CSSPropertyAsBuffer(null, '');
				tmpPropertyBuffer._buffer.set(groupBuffer.slice(c, c + this.itemSize), 0);

				this.setPropAfterResolvingCanonicalUnits(tmpPropertyBuffer, isFontSizeProp);
				this._buffer.set(tmpPropertyBuffer._buffer, i);

				c += this.itemSize;
				continue;
			}
			// Handling of the font-sizes caches : we must have the size AND the family to compute a cache
			// So we trigger cache-building only when we apply styles on a layout node
			else if (groupName === inheritedAttributesStr // hard-coded for optimization
				&& this.propertiesStaticArray[i / this.itemSize] === fontFamilyStr
				&& groupBuffer[c + isInitialValueIdx] !== 1) {
				//			console.error(groupName);
				fontFamily = groupBuffer.bufferToPartialString(c + reprIdx);

				// Get the fontSize from the next Buffer in the loop, as we don't know yet if the local size is the actual size
				// In the PropertyDescriptors, we chose to have the family before the size
				tmpPropertyBuffer = new CSSPropertyAsBuffer(null, fontFamilyStr);
				tmpPropertyBuffer._buffer.set(groupBuffer.slice(c + this.itemSize, c + this.itemSize * 2), 0);
				fontSize = tmpPropertyBuffer.getValueAsNumber().toString() + tmpPropertyBuffer.getUnitAsString();

				// TODO: find in which cases the fontSize is 0 : seems we apply populateStyles before inheritedStyles
				//			if (fontSize === '0')
				//				fontSize = this.getPropAsNumber(fontSizeStr) + this.getUnitAsString(fontSizeStr);
				if (fontSize !== '0') {
					if (!this.isFontSizeBufferInCache(fontSize, fontFamily))
						this.addFontSizeBufferToCache(fontSize, fontFamily);
				}
			}

			// Handling of fontSizes in percents
			else if (!setFromInherited
				&& groupName === inheritedAttributesStr // hard-coded for optimization
				&& this.propertiesStaticArray[i / this.itemSize] === fontSizeStr
				&& groupBuffer[c + isInitialValueIdx] !== 1) {

				tmpPropertyBuffer = new CSSPropertyAsBuffer(null, fontSizeStr);
				tmpPropertyBuffer._buffer.set(groupBuffer.slice(c, c + this.itemSize), 0);

				if (tmpPropertyBuffer.getTokenTypeAsNumber() === percentageTokenType) {
					this.setPropAfterResolvingCanonicalUnits(tmpPropertyBuffer, true);
					groupBuffer.set(tmpPropertyBuffer._buffer, c);
				}
			}

			if (groupBuffer[c + isInitialValueIdx] !== 1)
				this._buffer.set(groupBuffer.slice(c, c + this.itemSize), i);
			c += this.itemSize;
		}
	}
	/**
	 * @param {string} fontSize
	 * @param {string} fontFamily
	 * @returns {boolean}
	 */
	isFontSizeBufferInCache(fontSize: string, fontFamily: string) {
		return registries.fontSizeBuffer.has(fontSize + ' ' + fontFamily);
	}
	/**
	 * @param {string} fontSize
	 * @param {string} fontFamily
	 */
	addFontSizeBufferToCache(fontSize: string, fontFamily: string) {
		registries.fontSizeBuffer.set(fontSize + ' ' + fontFamily, new FontSizeBuffer(fontSize, fontFamily));
	}
	/**
	 * @param {string} groupName
	 * @param {boolean} bool
	 */
	setGroupIsInitialValue(groupName: string, bool: boolean) {
		var c = 0,
			boundaries = this.propertiesAccessGroupsBoundaries,
			isInitialValueIdx = CSSPropertyAsBuffer.bufferSchema.isInitialValue.start;
		for (var i = boundaries.start * this.itemSize, end = i + boundaries.length * this.itemSize; i < end; i += this.itemSize) {
			this._buffer.set([+(bool || 0)], i + isInitialValueIdx);
		}
	}
	/**
	 * @param {string} propName
	 * @returns {number}
	 */
	getIsInitialValue(propName: string) {
		var propBuffer = this.getProp(propName);
		return propBuffer.getIsInitialValue();
	}
	/**
	 * @param {string} propName
	 * @returns {boolean}
	 */
	getIsInitialValueAsBool(propName: string) {
		var propBuffer = this.getProp(propName);
		return propBuffer.getIsInitialValueAsBool();
	}
	/**
	 * @param {string} propName
	 * @returns {string}
	 */
	getTokenTypeForPropAsString(propName: string) {
		var propBuffer = this.getProp(propName);
		return propBuffer.tokenTypeToString();
	}
	/**
	 * @param {string} propName
	 * @returns {number}
	 */
	getTokenTypeForPropAsConstant(propName: string) {
		var propBuffer = this.getProp(propName);
		return propBuffer.tokenTypeToNumber();
	}
	// getPropAsString() is an alias for bufferedValueToString()
	// TODO: unify
	/**
	 * @param {string} propName
	 * @returns {string}
	 */	
	getPropAsString(propName: string) {
		return this.bufferedValueToString(propName);
	}
	// getPropAsNumber() is an alias for bufferedValueToNumber(propName)
	// TODO: unify
	/**
	 * @param {string} propName
	 * @returns {number}
	 */	
	getPropAsNumber(propName: string) {
		return this.bufferedValueToNumber(propName);
	}
	/**
	 * @param {string} propName
	 * @returns {string}
	 */	
	getUnitAsString(propName: string) {
		var propBuffer = this.getProp(propName);
		return propBuffer.getUnitAsString();
	}
	/**
	 * @param {string} propName
	 * @returns {string}
	 */	
	getValueTypeAsString(propName: string) {
		var propBuffer = this.getProp(propName);
		return propBuffer.getValueTypeAsString();
	}
	/**
	 * @param {string} propName
	 * @returns {number}
	 */	
	getValueTypeAsNumber(propName: string) {
		var propBuffer = this.getProp(propName);
		return propBuffer.getValueTypeAsNumber();
	}
	/**
	 * @param {string} propName
	 * @returns {string}
	 */	
	bufferedValueToString(propName: string) {
		var propBuffer = this.getProp(propName);
		return propBuffer.bufferedValueToString();
	}
	/**
	 * @param {string} propName
	 * @returns {number}
	 */	
	bufferedValueToNumber(propName: string) {
		var propBuffer = this.getProp(propName);
		//	console.log(propBuffer);
		return propBuffer.bufferedValueToNumber();
	}
	/**
	 * @param {string} propName
	 * @returns {string}
	 */	
	fastBufferedValueToString(propName: string) {
		var propIndex = this.getPosForProp(propName) * this.itemSize,
			propLength = this._buffer[propIndex + CSSPropertyAsBuffer.bufferSchema.reprLength.start],
			propOffset = CSSPropertyAsBuffer.bufferSchema.repr.start,
			propStartIndex = propIndex + propOffset,
			propEndIndex = propStartIndex + propLength;
		return bufferToString(
			this._buffer.slice(propStartIndex, propEndIndex),
			propLength
		);
	}
	/**
	 * @param {string} propName
	 * @returns {number}
	 */	
	fastBufferedValueToNumber(propName: string) {
		var propIndex = this.getPosForProp(propName) * this.itemSize,
			propOffset = CSSPropertyAsBuffer.bufferSchema.propertyValue.start,
			propStartIndex = propIndex + propOffset,
			propEndIndex = propStartIndex + CSSPropertyAsBuffer.bufferSchema.propertyValue.length;
		return CSSPropertyAsBuffer.prototype.byteTuppleTo16bits(
			this._buffer.slice(propStartIndex, propEndIndex).buffer
		);
	}
	/**
	 * @method getTextDimensions
	 * @param {String} textContent
	 */
	getTextDimensions(textContent: string, fontStyle: string) {
		//	console.log(this.getAugmentedFontStyle());
		if (!textContent.length)
			return 0;
		var textSize = textSizeGetter.getTextSizeDependingOnStyle(
			textContent,
			fontStyle
		);
		return textSize[0] - textSize[0] / 21;
	}
}




/**
 * Precomputed, per-group CSS property set buffer for initialization.
 *
 * Populates a CSSPropertySetBuffer with initial values from descriptors.
 * Stores initial property buffers by attribute name and group.
 */
export const initialCSSSliceBuffers = (() => {
    const map = new Map();
    for (const groupName in splittedCSSPropertyDescriptors) {
		const category  = groupName as CSSCategory;
        map.set(
			groupName,
			CSSStyleRuleSliceAsBuffer.fromCategory<
				/** @ts-ignore */
				typeof splittedCSSPropertyDescriptors[(category)],
				typeof allCSSPropertyKeys
			>(
				splittedCSSPropertyDescriptors[category],
				allCSSPropertyKeys,
				bufferBoundaries.allSupportedCSSProperties
			)
		);
    }
    return map;
})();



export default CSSStyleRuleSliceAsBuffer;