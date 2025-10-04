/**
 * High-level CSS rule facade over four category slices.
 * 
 * Data flow:
 * - External attributes map  
 *  -> category slice ([CSSRuleSliceIFaceBase](cci:2://file:///./CSSStyleRuleAsBuffer.js:23:0-77:1)) 
 *  -> per-prop buffer([CSSPropertyBuffer](cci:2://file://./CSSPropertyAsBuffer.js:92:0-478:1))
 *  -> Shorthands resolved in [CSSPropertySetBuffer.setPropFromBuffer()] (cci:1://file:///./CSSStyleRuleSliceAsBuffer.js:129:1-148:2).
 * 
 * flowchart LR
 * A[attributes map] --> B[CSSRuleSliceIFaceBase (per category)]
 * B --> C[CSSPropertyAsBuffer.setValue(value)]
 * C --> D[CSSStyleRuleSliceAsBuffer.setPropFromBuffer()]
 * D --> E[TypedArray storage]
 * D --> F[Shorthand expansion/aliasing]
 * 
 * @see style/CSSStyleRuleSliceAsBuffer.js (CSSPropertySetBuffer: compact set of properties, shorthand parsing)
 * @see style/CSSPropertyAsBuffer.js (CSSPropertyBuffer: compact per-property binary representation)
 * @see style/CSSPropertyDescriptors.js (metadata: initial values, shorthand expansions, aliases)
 */


/**
 * @typedef {import('./CSSPropertyDescriptors.js').CSSCategory} CSSCategory
 */
import CSSPropertyAsBuffer from './CSSPropertyAsBuffer.js';
import {categories, propToCategory, knownAttributesMapByCagegory, allCSSPropertyDescriptors} from './CSSPropertyDescriptors.js';
import CSSStyleRuleSliceAsBuffer from './CSSStyleRuleSliceAsBuffer.js';
import {InitialPropertySetBuffers} from './CSSStyleRuleSliceAsBuffer.js';
import {camelToHyphens} from '../nativeTypesUtilities/StringUtilities.js';






/**
 * CSSRuleSliceIFaceBase manages a slice of CSS properties for a given category
 * (e.g., `inheritedAttributes`, `locallyEffectiveAttributes`, `boxModelAttributes`, `strictlyLocalAttributes`).
 *
 * Responsibilities:
 * - Constructs a `CSSPropertySetBuffer` for its category using `CSSStyleRuleSliceAsBuffer.fromCategory()` and `InitialPropertySetBuffers`.
 * - Filters an incoming attribute map to the category's known properties.
 * - For each kept property, creates a `CSSPropertyBuffer`, calls `setValue(value)` (raw-first path),
 *   marks it as non-initial, then delegates to `CSSPropertySetBuffer.setPropFromBuffer()` which resolves shorthands and aliases.
 *
 * @see CSSStyleRuleSliceAsBuffer.js (`CSSPropertySetBuffer`) for the underlying buffer layout and shorthand expansion.
 * @see CSSPropertyAsBuffer.js (`CSSPropertyBuffer`) for the compact per-property binary representation.
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
	 * Converts incoming attribute map to CSSPropertyBuffer instances:
	 * Ignores attributes depending on if they pertain to the self-handled category of CSS props  :
	 * and assign the filtered ones to the embedded CSSRuleAsBufferIFace
	 * 
	 * - Uses new CSSPropertyBuffer(null, attrName) then setValue(attributes[attrName])
	 * - Passes to setPropFromBuffer(), which resolves shorthands/aliases.
	 * @see CSSPropertySetBuffer.setPropFromBuffer()
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
				
			packedCSSProperty = new CSSPropertyAsBuffer(null, attrName);
			packedCSSProperty.setValue(attributes[attrName]);

			// Set the isInitialValue flag to false
			packedCSSProperty._buffer.set([0], CSSPropertyAsBuffer.bufferSchema.isInitialValue.start);
			
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


/**
 * CSSRuleAsBuffer is a high-level façade over four category slices:
 * - `inheritedAttributes`
 * - `locallyEffectiveAttributes`
 * - `boxModelAttributes`
 * - `strictlyLocalAttributes`
 *
 * It orchestrates initialization and routing of get/set operations:
 * - On construction, it creates one `CSSRuleSliceIFaceBase` per category, each backed by a `CSSPropertySetBuffer` initialized
 *   from `InitialPropertySetBuffers` (pre-populated with descriptor initial values).
 * - `set(attr, value)`: builds a `CSSPropertyBuffer`, calls `setValue(value)` (raw-first; preserves composite values), marks non-initial,
 *   and forwards to the correct slice's `setPropFromBuffer()` which resolves shorthands/aliases and stores into the typed-array buffer.
 * - `get(attr)`: reads back the string representation via the owning slice.
 * - `linearize()`: serializes defined properties to CSS text.
 *
 * See also:
 * @see CSSStyleRuleSliceAsBuffer.js for buffer management and shorthand parsing.
 * @see CSSPropertyDescriptors.js for property metadata (initial values, shorthand expansions, aliases).
 */
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
		if (!propToCategory.has(attr))
			throw new Error('Unsupported CSS Property: ' + attr);
			
		return this[propToCategory.get(attr)].CSSRuleAsBufferIFace.bufferedValueToString(attr);
	}
	/**
	 * 
	 * @param {string} attr 
	 * @param {string|number} value 
	 */
	set(attr, value) {
		if (!propToCategory.has(attr))
			throw new Error('Unsupported CSS Property: ' + attr);
			
		const propBuffer = new CSSPropertyAsBuffer(null, attr);
		propBuffer.setValue(value);
		propBuffer._buffer.set([0], CSSPropertyAsBuffer.bufferSchema.isInitialValue.start);
		this[propToCategory.get(attr)].CSSRuleAsBufferIFace.setPropFromBuffer(attr, propBuffer);
	}
	
	// FIXME: should update all partial lists down the object
	setApply(attrList) {
	//		Object.entries(attrList).forEach(function(pair) {
	//			this.stdAttributes.set(pair[0], pair[1]);
	//		}, this);
	}

	linearize() {
		const defs = this.getAllDefinedAttributes();
		const lines = [];
		for (const k in defs) lines.push(`${camelToHyphens(k)} : ${defs[k]};`);
		return lines.join('\n');
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

	static fromAST(ast) {
		var name, attrList = {};
		// ast is an array of declarations
		ast.forEach(function(declaration) {
			// YET CSSOM ? it seems...
			
			name = declaration.name.hyphensToDromedar();
			if (allCSSPropertyDescriptors.hasOwnProperty(name)) {
				attrList[name] = declaration.value.reduce(CSSRuleAsBuffer.flattenDeclarationValues, '');
			}
		});
		// FIXME: selector is first param, but where do we get it?
		return new CSSRuleAsBuffer('', attrList);
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