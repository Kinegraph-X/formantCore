/**
 * Constructor AttributesList
 * 
 */
/**
 * @typedef {import('./CSSPropertyDescriptors.js').CSSCategory} CSSCategory
 */
import CSSPropertyBuffer from './CSSPropertyAsBuffer.js';
import {categories, knownAttributesMapByCagegory, allCSSPropertyDescriptors, splittedCSSPropertyDescriptors} from './CSSPropertyDescriptors.js';
import CSSStyleRuleSliceAsBuffer from './CSSStyleRuleSliceAsBuffer.js';
import {InitialPropertySetBuffers} from './CSSStyleRuleSliceAsBuffer.js';
import {camelToHyphens} from '../nativeTypesUtilities/StringUtilities.js';






/**
 * Construct. BaseClass SplittedAttributesListBaseClass
 * 
 * @param attributes Object : partial AttributesList-Like (only significative keys defined)
 */
class CSSRuleSliceIFaceBase {
	static objectType = 'SplittedAttributesListBaseClass';
	/** @type {CSSCategory} */
	static purpose = 'inheritedAttributes';
	/**
	 * 
	 * @param {Object<string, string>} attributes 
	 */
	constructor(attributes) {
		const purpose = /** @type {typeof CSSRuleSliceIFaceBase} */ (this.constructor).purpose;
		this.CSSRuleAsBufferIFace = CSSStyleRuleSliceAsBuffer.fromCategory(
				purpose,
				InitialPropertySetBuffers.get(purpose)._buffer
			);
		this.disambiguateAttributes(attributes);
	}

	/**
	 * Ignores attributes depending on if they pertain to the self-handled category of CSS props  :
	 * and assign the filtered ones to the embedded CSSRuleAsBufferIFace
	 * 
	 * It also logs a warning if we encounter a non-supported CSS prop
	 * (for now, we're not aimed at supporting the entire spec)
	 * 
	 * @param {Object<string, string>} attributes
	 */
	disambiguateAttributes(attributes) {
		const purpose = /** @type {typeof CSSRuleSliceIFaceBase} */ (this.constructor).purpose; 
		const knownAttributes = knownAttributesMapByCagegory.get(purpose);
		let	packedCSSProperty;
		
		for (const attrName in attributes) {
			if (!allCSSPropertyDescriptors[attrName]) {
				console.warn('Unsupported CSS Property:', attrName);
				continue;
			}
			/** @ts-ignore : can't be undefined */
			else if ((knownAttributes).indexOf(attrName) < 0)
				continue;
				
			packedCSSProperty = new CSSPropertyBuffer(null, attrName);
			packedCSSProperty.setValue(attributes[attrName]);

			// Set the isInitialValue flag to false
			packedCSSProperty._buffer.set([0], CSSPropertyBuffer.bufferSchema.isInitialValue.start);
			
			this.CSSRuleAsBufferIFace.setPropFromBuffer(attrName, packedCSSProperty);
		}
	}
}



class InheritedAttributesList extends CSSRuleSliceIFaceBase {
	static objectType = 'InheritedAttributesList';
	static purpose = categories.inheritedAttributes;
}

class LocallyEffectiveAttributesList extends CSSRuleSliceIFaceBase {
	static objectType = 'LocallyEffectiveAttributesList';
	static purpose = categories.locallyEffectiveAttributes;
}

class BoxModelAttributesList extends CSSRuleSliceIFaceBase {
	static objectType = 'BoxModelAttributesList';
	static purpose = categories.boxModelAttributes;
}

class StrictlyLocalAttributesList extends CSSRuleSliceIFaceBase {
	static objectType = 'StrictlyLocalAttributesList';
	static purpose = categories.strictlyLocalAttributes;
}



class CSSRuleAsBuffer {
	selector;
	inheritedAttributes;
	locallyEffectiveAttributes;
	boxModelAttributes;
	strictlyLocalAttributes;
	/**
	 * @param {string} selector
	 * @param {Object<string, string>} attributes 
	 */
	constructor(selector, attributes) {
		this.selector = selector;

		this.inheritedAttributes = new InheritedAttributesList(attributes);
		this.locallyEffectiveAttributes = new LocallyEffectiveAttributesList(attributes);
		this.boxModelAttributes = new BoxModelAttributesList(attributes);
		this.strictlyLocalAttributes = new StrictlyLocalAttributesList(attributes);
	}
	/**
	 * 
	 * @param {string} attr 
	 * @returns 
	 */
	get(attr) {
		var propBuffer;
		for (var propGroup in splittedCSSPropertyDescriptors) {
			if (splittedCSSPropertyDescriptors[propGroup][attr]) {
				return this[propGroup].CSSRuleAsBufferIFace.bufferedValueToString(attr);
			}
		}
	}
	/**
	 * 
	 * @param {string} attr 
	 * @param {string|number} value 
	 */
	set(attr, value) {
		const val = value.toString();
		var propBuffer;
		for (var propGroup in splittedCSSPropertyDescriptors) {
			if (splittedCSSPropertyDescriptors[propGroup][attr]) {
				propBuffer = new CSSPropertyBuffer();
				propBuffer.setValue(val);
				propBuffer.setIsInitialValue();
				this[propGroup].CSSRuleAsBufferIFace.setPropFromBuffer(attr, propBuffer);
			}
		}
	}
	
	// FIXME: should update all partial lists down the object
	setApply(attrList) {
	//		Object.entries(attrList).forEach(function(pair) {
	//			this.stdAttributes.set(pair[0], pair[1]);
	//		}, this);
	}

	linearize() {
		const attributes = this.getAllDefinedAttributes();
		var str = '', current = '', attrCount = Object.keys(attributes).length, c = 0;
		for (var prop in attributes) {
			c++;
			current = attributes[prop];

			str += camelToHyphens(prop) + ' : ' + current + ';';

			if (c !== attrCount)
				str += '\n';
		};
		return str;
	}
	/**
	 * 
	 * @returns {{[key: string]: string}}
	 */
	getAllAttributes() {
		/** @type {{[key: string]: string}} */
		var allAttributes = {};
		for (var attrGroup in categories) {
			Object.assign(allAttributes, this[attrGroup].CSSRuleAsBufferIFace.getPropertyGroupAsAttributesList(attrGroup));
		}
		return allAttributes;
	}
	/**
	 * 
	 * @returns {{[key: string]: string}}
	 */
	getAllDefinedAttributes() {
		/** @type {{[key: string]: string}} */
		var allAttributes = {};
		for (var attrGroup in categories) {
			Object.assign(allAttributes, this[attrGroup].CSSRuleAsBufferIFace.getDefinedPropertiesFromGroupAsAttributesList(attrGroup));
		}
		return allAttributes;
	}

	fromAST(ast) {
		var name, attrList = {};
		// ast is an array of declarations
		ast.forEach(function(declaration) {
			// YET CSSOM ? it seems...
			
			name = declaration.name.hyphensToDromedar();
			if (allCSSPropertyDescriptors.hasOwnProperty(name)) {
				attrList[name] = declaration.value.reduce(CSSRuleAsBuffer.flattenDeclarationValues, '');
			}
		});
		return new CSSRuleAsBuffer(attrList);
	}

	// A callback for the Reducer we use as a hacky serializer for the objects we get from the CSS ast
	static flattenDeclarationValues(acc, item, key) {
		acc += item.tokenType !== 'WHITESPACE'
			? (item.tokenType === 'COMMA'
				? ','
				: (item.tokenType === 'DIMENSION' || item.tokenType === 'NUMBER'
					? item.repr + (item.unit || '')
					: (item.tokenType === 'PERCENTAGE'
						? item.repr + '%'
						: (item.type === 'FUNCTION'		// NOT a DECLARATION (item.type): it's a high-level type
							? item.name + '(' + item.value.reduce(CSSRuleAsBuffer.flattenDeclarationValues, '') + ')'
							: item.value)
					)
				)
			)
			: (acc.length ? ' ' : '');		// no leading space in resulting string CSS values
		return acc;
	}
}







export default CSSRuleAsBuffer;