/**
 * construct. CSSPropertySetBuffer
 */

import MemoryMapBuffer from './MemoryMapBuffer.js';
import registries from '../Registries.js';
import CSSPropertyBuffer from './CSSPropertyAsBuffer.js';
import CSSPropertyDescriptors from './CSSPropertyDescriptors.js';
import FontSizeBuffer from './FontSizeBuffer.js';

import parser from '../../third-party/css-parser_forked_normalized.js';

import TextSizeGetter from '../DOM/TextSizeGetter.js';
const textSizeGetter = new TextSizeGetter();

/**
 * @constructor CSSPropertySetBuffer
 */
class CSSPropertySetBuffer extends MemoryMapBuffer {
	static objectType = 'CSSPropertySetBuffer';
	category = null;
	propertiesStaticArray = [];
	propertiesAccessGroupsBoundaries = {};

	 /**
	  * This Factory is the only way to build a CSSPropertySetBuffer.
     * Create a buffer initialized only for a given CSS property category.
     * Category must be one of the keys in CSSPropertyDescriptors.splitted.
     * @param {string} 
	 * @param {Uint8Array} [initialContent]
     * @returns {CSSPropertySetBuffer}
     */
	 static fromCategory(category, initialContent) {
        const props = Object.keys(CSSPropertyDescriptors.splitted[category] || {});

		if (!initialContent) {
			const itemSize = CSSPropertyBuffer.prototype.bufferSchema.size;
			initialContent = new Uint8Array(props.length * itemSize);
			let offset = 0;

			props.forEach((attrName) => {
				const packed = new CSSPropertyBuffer(null, attrName);
				packed.setValue(CSSPropertyDescriptors.all[attrName].prototype.initialValue);
				initialContent.set(packed._buffer, offset);
				// mark as initial value
				initialContent.set([1], offset + CSSPropertyBuffer.prototype.bufferSchema.isInitialValue.start);
				offset += itemSize;
			});
		}

        const inst = new CSSPropertySetBuffer(initialContent);
        // scope meta for clarity
        inst.category = category;
        inst.propertiesStaticArray = props;
        inst.propertiesAccessGroupsBoundaries = { [category]: { start: 0, length: props.length } };
        return inst;
    }

	static inheritedPropertiesStaticArray = Object.keys(CSSPropertyDescriptors.splitted.inheritedAttributes);

	/**
	 * @param {Uint8Array} initialContent
	 */
	constructor(initialContent) {
		var itemSize = CSSPropertyBuffer.prototype.bufferSchema.size;
		MemoryMapBuffer.call(this, itemSize, initialContent.byteLength / itemSize);

		this._buffer.set(
			initialContent
		);
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
	getPosForProp(propName) {
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
	getPropForPos(pos) {
		return this.propertiesStaticArray[pos];
	}
	/**
	 * @param {string} propName
	 * @returns {CSSPropertyBuffer}
	 */
	getProp(propName) {
		var posForProp = this.getPosForProp(propName) * this.itemSize;
		//	if (propName === 'display')
		//		console.log(posForProp);
		var propAsBuffer = new CSSPropertyBuffer(
			this._buffer.slice(posForProp, posForProp + this.itemSize),
			propName
		);
		return propAsBuffer;
	}
	/**
	 * @param {string} propName
	 * @param {CSSPropertyBuffer} propBuffer
	 */
	setPropFromBuffer(propName, propBuffer) {
		var resolvedPropName = propName, posForProp;

		if (CSSPropertyDescriptors.all[resolvedPropName].prototype.isShorthand) {
			this.setPropFromShorthand(resolvedPropName, propBuffer.getValueAsString());
		}
		else {
			if (CSSPropertyDescriptors.all[resolvedPropName].prototype.isAlias)
				resolvedPropName = CSSPropertyDescriptors.all[resolvedPropName].prototype.expandedPropNames[0];
			if ((posForProp = this.getPosForProp(resolvedPropName) * this.itemSize) < 0)
				return;
			this._buffer.set(propBuffer._buffer, posForProp);
		}
	}
	/**
	 * @param {string} propName
	 * @param {string} value
	 */
	setPropFromShorthand(propName, value) {

		//	console.log('	', propName, value);
		if (CSSPropertyDescriptors.all[propName].prototype.mayBeAbbreviated) {
			//		console.log('setPropFromShorthand', propName, value);
			this.handleAbbreviatedValues(propName, value);
			return;
		}

		// FIXME: (IMPROVEME)
		// We rely on the order of CSSPropertyDescriptors.all[propName].prototype.expandedPropNames
		// The sorting function won't work for all use-cases,
		// as it relies on the fact that shorthands contains uniquely typed values in the sequence of tokens
		var tmpBuffer, expandedPropertyName;
		var valueList = this.sortValuesFromShorthand(propName, value);

		//	if (!valueList)
		//		return;
		// TODO: optimization : this may be passed a real result from the parser => benchmark
		//	console.log('		setPropFromShorthand', propName, valueList);
		valueList.forEach(function (val, key) {
			if (val === null)
				return;

			expandedPropertyName = CSSPropertyDescriptors.all[propName].prototype.expandedPropNames[key];
			if (CSSPropertyDescriptors.all[expandedPropertyName].prototype.mayBeAbbreviated) {
				this.handleAbbreviatedValues(expandedPropertyName, val);
				return;
			}

			tmpBuffer = new CSSPropertyBuffer(null, expandedPropertyName);
			//		console.log('	', expandedPropertyName, val);
			tmpBuffer.setValue(val);
			//		console.log('		', tmpBuffer.bufferedValueToString());
			this.setPropFromBuffer(expandedPropertyName, tmpBuffer);
		}, this);
	}
	/**
	 * @param {string} propName
	 * @param {string} value
	 * @returns {Array<string>}
	 */
	sortValuesFromShorthand(propName, value) {

		if (CSSPropertyDescriptors.splitted.boxModelAttributes[propName]) {
			var tokenTypeFromParser;
			var parsedValue = parser.parseAListOfComponentValues(value);
			var sortedProp = { dimension: null, ident: null, hash: null };
			parsedValue.forEach(function (val) {
				tokenTypeFromParser = Object.getPrototypeOf(val).tokenType;
				//			console.log('	', tokenTypeFromParser);
				switch (tokenTypeFromParser) {
					case 'WHITESPACE':
					case 'COMMA':
						break;
					case 'NUMBER':
						// There's an ambiguity in the CSS spec:
						// The parser is designed to assume that every integer/float
						// non-followed by an alphabetic char is a number (css-parser.js - line 254 && https://www.w3.org/TR/css-syntax-3/#consume-a-numeric-token).
						// But border-width may only be of type <length>,
						// and then is a dimension => it has to be an ident-like, then it is of type string
						if (propName === 'border')
							sortedProp.dimension = val.repr;

						else
							sortedProp.dimension = val.value;
						break;
					case 'DIMENSION':
						sortedProp.dimension = val.repr;
						break;
					case 'PERCENTAGE':
						sortedProp.dimension = val.repr;
						break;
					case 'HASH':
						sortedProp.hash = val.repr;
						break;
					case 'IDENT':
						sortedProp.ident = val.repr;
						break;
					case 'FUNCTION':
						sortedProp.hash = CSSPropertyBuffer.prototype.functionToCanonical.call(null, val).repr;
					default: break;
				}
			}, this);
			return Object.values(sortedProp);
		}



		//	else if (propName === 'background') {
		//		
		//	} etc.
		else {
			return value.match(/[a-zA-Z0-9#\/:.,%-]+/g) || [];
		}
	}
	/**
	 * @param {string} propName
	 * @param {string} value
	 */
	handleAbbreviatedValues(propName, value) {
		var offset = 0, tmpBuffer, valueList = value.split(' '), expandedPropertyName;
		// valueList = parser.parseAListOfComponentValues(value.trim())
		if (valueList.length === 1) {
			CSSPropertyDescriptors.all[propName].prototype.expandedPropNames.forEach(function (expandedPropertyName, key) {
				tmpBuffer = new CSSPropertyBuffer(null, expandedPropertyName);
				tmpBuffer.setValue(valueList[0]);
				this.setPropFromBuffer(expandedPropertyName, tmpBuffer);
			}, this);
		}
		else if (valueList.length === 2) { // the property shall include 1 whitespace
			CSSPropertyDescriptors.all[propName].prototype.expandedPropNames.forEach(function (expandedPropertyName, key) {
				tmpBuffer = new CSSPropertyBuffer(null, expandedPropertyName);
				if (key === 0 || key === 2)
					tmpBuffer.setValue(valueList[0]);

				else
					tmpBuffer.setValue(valueList[1]);
				this.setPropFromBuffer(expandedPropertyName, tmpBuffer);
			}, this);
		}
		else if (valueList.length === 3) { // the property shall include 2 whitespace
			CSSPropertyDescriptors.all[propName].prototype.expandedPropNames.forEach(function (expandedPropertyName, key) {
				tmpBuffer = new CSSPropertyBuffer(null, expandedPropertyName);
				if (key !== 3)
					tmpBuffer.setValue(valueList[key]);

				else
					tmpBuffer.setValue(valueList[1]);
				//			offset++;
				this.setPropFromBuffer(expandedPropertyName, tmpBuffer);
			}, this);
		}
		else if (valueList.length === 4) { // the property shall include 3 whitespace
			CSSPropertyDescriptors.all[propName].prototype.expandedPropNames.forEach(function (expandedPropertyName, key) {
				tmpBuffer = new CSSPropertyBuffer(null, expandedPropertyName);
				tmpBuffer.setValue(valueList[key]);
				//			offset++;
				this.setPropFromBuffer(expandedPropertyName, tmpBuffer);
			}, this);
		}
	}
	/**
	 * @param {CSSPropertyBuffer} overridePropBuffer
	 * @param {boolean} isFontSizeProp
	 * @param {string} originalPropName
	 */
	setPropAfterResolvingCanonicalUnits(overridePropBuffer, isFontSizeProp, originalPropName) {
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
		var propName;
		var c = 0;

		var ret = {};

		for (var i = 0, end = i + this.propertiesStaticArray.length * this.itemSize; i < end; i += this.itemSize) {
			propName = this.propertiesStaticArray[c];
			if (this._buffer[i + CSSPropertyBuffer.prototype.bufferSchema.isInitialValue.start] === 0) {
				ret[propName] = this.getProp(propName).getValueAsString();
			}
			c++;
		}

		return ret;
	}
	/**
	 * @param {string} groupName
	 * @returns {Object<string, CSSPropertyBuffer>}
	 */
	getPropertyGroupAsBufferMap(groupName) {
		var propName;
		var c = 0;
		var boundaries = this.propertiesAccessGroupsBoundaries[groupName];

		var ret = {};
		for (var i = boundaries.start * this.itemSize, end = i + boundaries.length * this.itemSize; i < end; i += this.itemSize) {
			propName = this.propertiesStaticArray[boundaries.start + c];
			ret[propName] = (new CSSPropertyBuffer(
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
	getPropertyGroupAsAttributesList(groupName) {
		var propName;
		var c = 0;
		var boundaries = this.propertiesAccessGroupsBoundaries[groupName];

		var ret = {};
		for (var i = boundaries.start * this.itemSize, end = i + boundaries.length * this.itemSize; i < end; i += this.itemSize) {
			propName = this.propertiesStaticArray[boundaries.start + c];
			ret[propName] = this.getProp(propName).getValueAsString();
			c++;
		}
		return ret;
	}
	/**
	 * @param {string} groupName
	 * @returns {Object<string, string>}
	 */
	getDefinedPropertiesFromGroupAsAttributesList(groupName) {
		var propName, propValue;
		var c = 0;
		var boundaries = this.propertiesAccessGroupsBoundaries[groupName];

		var ret = {};
		for (var i = boundaries.start * this.itemSize, end = i + boundaries.length * this.itemSize; i < end; i += this.itemSize) {
			propName = this.propertiesStaticArray[boundaries.start + c];
			if (this._buffer[i + CSSPropertyBuffer.prototype.bufferSchema.isInitialValue.start] === 0)
				ret[propName] = this.getProp(propName).getValueAsString();
			c++;
		}
		return ret;
	}
	/**
	 * @param {string} groupName
	 * @returns {Array<number>}
	 */
	getPropertyGroupAsBuffer(groupName) {
		var boundaries = this.propertiesAccessGroupsBoundaries[groupName];
		var start = boundaries.start * this.itemSize, end = start + boundaries.length * this.itemSize;
		return this._buffer.slice(start, end);
	}
	/**
	 * @param {string} groupName
	 * @param {Array<number>} groupBuffer
	 */
	setPropertyGroupFromGroupBuffer(groupName, groupBuffer) {
		var boundaries = this.propertiesAccessGroupsBoundaries[groupName];
		var start = boundaries.start * this.itemSize;
		this._buffer.set(groupBuffer, start);
	}
	/**
	 * @param {string} groupName
	 * @param {Array<number>} groupBuffer
	 * @param {boolean} setFromInherited
	 */
	overridePropertyGroupFromGroupBuffer(groupName, groupBuffer, setFromInherited) {
		//	console.log('called');
		var inheritedAttributesStr = 'inheritedAttributes', fontSizeStr = 'fontSize', fontFamilyStr = 'fontFamily', isFontSizeProp = false;
		var c = 0, boundaries = this.propertiesAccessGroupsBoundaries[groupName], fontSizeIdx = 0, tmpPropertyBuffer, fontFamily = '', fontSize = 0;

		for (var i = boundaries.start * this.itemSize, end = i + boundaries.length * this.itemSize; i < end; i += this.itemSize) {
			isFontSizeProp = false;

			// groupBuffer[c + offset] represents the flag "isInitialValue"
			//		console.log('TokenType', groupBuffer[c + CSSPropertyBuffer.prototype.bufferSchema.tokenType.start])
			//		console.log(i / this.itemSize, this.propertiesStaticArray[i / this.itemSize], fontFamilyStr);
			// Not optimized way to handle 'em' CSS units (they depend on the size of the letter "M" in the current font-style)
			// TODO: is there a way to optimize this ?
			// FIXME: 
			if (groupBuffer[c + CSSPropertyBuffer.prototype.bufferSchema.tokenType.start] === CSSPropertyBuffer.prototype.TokenTypes.DimensionToken) {
				// && groupBuffer[c + CSSPropertyBuffer.prototype.bufferSchema.isInitialValue.start] !== 1
				tmpPropertyBuffer = new CSSPropertyBuffer(null, '');
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
				&& groupBuffer[c + CSSPropertyBuffer.prototype.bufferSchema.isInitialValue.start] !== 1) {
				//			console.error(groupName);
				fontFamily = groupBuffer.bufferToPartialString(c + CSSPropertyBuffer.prototype.bufferSchema.repr.start);

				// Get the fontSize from the next Buffer in the loop, as we don't know yet if the local size is the actual size
				// In the PropertyDescriptors, we chose to have the family before the size
				tmpPropertyBuffer = new CSSPropertyBuffer(null, fontFamilyStr);
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
				&& groupBuffer[c + CSSPropertyBuffer.prototype.bufferSchema.isInitialValue.start] !== 1) {

				tmpPropertyBuffer = new CSSPropertyBuffer(null, fontSizeStr);
				tmpPropertyBuffer._buffer.set(groupBuffer.slice(c, c + this.itemSize), 0);

				if (tmpPropertyBuffer.getTokenTypeAsNumber() === CSSPropertyBuffer.prototype.TokenTypes.PercentageToken) {
					this.setPropAfterResolvingCanonicalUnits(tmpPropertyBuffer, true);
					groupBuffer.set(tmpPropertyBuffer._buffer, c);
				}
			}

			if (groupBuffer[c + CSSPropertyBuffer.prototype.bufferSchema.isInitialValue.start] !== 1)
				this._buffer.set(groupBuffer.slice(c, c + this.itemSize), i);
			c += this.itemSize;
		}
	}
	/**
	 * @param {string} fontSize
	 * @param {string} fontFamily
	 * @returns {boolean}
	 */
	isFontSizeBufferInCache(fontSize, fontFamily) {
		return registries.fontSizeBuffer.has(fontSize + ' ' + fontFamily);
	}
	/**
	 * @param {string} fontSize
	 * @param {string} fontFamily
	 */
	addFontSizeBufferToCache(fontSize, fontFamily) {
		registries.fontSizeBuffer.set(fontSize + ' ' + fontFamily, new FontSizeBuffer(fontSize, fontFamily));
	}
	/**
	 * @param {string} groupName
	 * @param {boolean} bool
	 */
	setGroupIsInitialValue(groupName, bool) {
		var c = 0,
			boundaries = this.propertiesAccessGroupsBoundaries[groupName],
			schemaStart = CSSPropertyBuffer.prototype.bufferSchema.isInitialValue.start;
		for (var i = boundaries.start * this.itemSize, end = i + boundaries.length * this.itemSize; i < end; i += this.itemSize) {
			this._buffer.set([+(bool || 0)], i + schemaStart);
		}
	}
	/**
	 * @param {string} propName
	 * @returns {number}
	 */
	getIsInitialValue(propName) {
		var propBuffer = this.getProp(propName);
		return propBuffer.getIsInitialValue();
	}
	/**
	 * @param {string} propName
	 * @returns {boolean}
	 */
	getIsInitialValueAsBool(propName) {
		var propBuffer = this.getProp(propName);
		return propBuffer.getIsInitialValueAsBool();
	}
	/**
	 * @param {string} propName
	 * @returns {string}
	 */
	getTokenTypeForPropAsString(propName) {
		var propBuffer = this.getProp(propName);
		return propBuffer.tokenTypeToString();
	}
	/**
	 * @param {string} propName
	 * @returns {number}
	 */
	getTokenTypeForPropAsConstant(propName) {
		var propBuffer = this.getProp(propName);
		return propBuffer.tokenTypeToNumber();
	}
	// getPropAsString() is an alias for bufferedValueToString()
	// TODO: unify
	/**
	 * @param {string} propName
	 * @returns {string}
	 */	
	getPropAsString(propName) {
		return this.bufferedValueToString(propName);
	}
	// getPropAsNumber() is an alias for bufferedValueToNumber(propName)
	// TODO: unify
	/**
	 * @param {string} propName
	 * @returns {number}
	 */	
	getPropAsNumber(propName) {
		return this.bufferedValueToNumber(propName);
	}
	/**
	 * @param {string} propName
	 * @returns {string}
	 */	
	getUnitAsString(propName) {
		var propBuffer = this.getProp(propName);
		return propBuffer.getUnitAsString();
	}
	/**
	 * @param {string} propName
	 * @returns {string}
	 */	
	getValueTypeAsString(propName) {
		var propBuffer = this.getProp(propName);
		return propBuffer.getValueTypeAsString();
	}
	/**
	 * @param {string} propName
	 * @returns {number}
	 */	
	getValueTypeAsNumber(propName) {
		var propBuffer = this.getProp(propName);
		return propBuffer.getValueTypeAsNumber();
	}
	/**
	 * @param {string} propName
	 * @returns {string}
	 */	
	bufferedValueToString(propName) {
		var propBuffer = this.getProp(propName);
		return propBuffer.bufferedValueToString();
	}
	/**
	 * @param {string} propName
	 * @returns {number}
	 */	
	bufferedValueToNumber(propName) {
		var propBuffer = this.getProp(propName);
		//	console.log(propBuffer);
		return propBuffer.bufferedValueToNumber();
	}
	/**
	 * @param {string} propName
	 * @returns {string}
	 */	
	fastBufferedValueToString(propName) {
		var propIndex = this.getPosForProp(propName) * this.itemSize, propLength = this._buffer[propIndex + CSSPropertyBuffer.prototype.bufferSchema.reprLength.start], propOffset = CSSPropertyBuffer.prototype.bufferSchema.repr.start, propStartIndex = propIndex + propOffset, propEndIndex = propStartIndex + propLength;
		return this._buffer.slice(propStartIndex, propEndIndex).bufferToString(propLength);
	}
	/**
	 * @param {string} propName
	 * @returns {number}
	 */	
	fastBufferedValueToNumber(propName) {
		var propIndex = this.getPosForProp(propName) * this.itemSize, propOffset = CSSPropertyBuffer.prototype.bufferSchema.propertyValue.start, propStartIndex = propIndex + propOffset, propEndIndex = propStartIndex + CSSPropertyBuffer.prototype.bufferSchema.propertyValue.length;
		return CSSPropertyBuffer.prototype.byteTuppleTo16bits(this._buffer.slice(propStartIndex, propEndIndex));
	}
	/**
	 * @method getTextDimensions
	 * @param {String} textContent
	 */
	getTextDimensions(textContent, fontStyle) {
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
export const InitialPropertySetBuffers = (() => {
    const map = new Map();
    for (const groupName in CSSPropertyDescriptors.splitted) {
        map.set(groupName, CSSPropertySetBuffer.fromCategory(groupName));
    }
    return map;
})();

var CachedCSSPropertySetBuffer = (function() {
	var packedCSSProperty, propertySetBuffer = new CSSPropertySetBuffer(new Uint8Array());
	for (var attrGroup in CSSPropertyDescriptors.splitted) {
		Object.keys(CSSPropertyDescriptors.splitted[attrGroup]).forEach(function(attrName) {
			packedCSSProperty = new CSSPropertyBuffer(null, attrName);
			packedCSSProperty.setValue(
				CSSPropertyDescriptors.all[attrName].prototype.initialValue
			);
			propertySetBuffer.setPropFromBuffer(attrName, packedCSSProperty);
		});
		propertySetBuffer.setGroupIsInitialValue(attrGroup, true);
	}
	return propertySetBuffer;
})()






export default CSSPropertySetBuffer;