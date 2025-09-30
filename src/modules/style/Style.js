/**
* Stylesheets
*/

import CSSSelectorsList from './CSSSelectorsList.js'
import CSSSelectorSetBuffer from './CSSSelectorSetBuffer.js'
import AdvancedAttributesList from './SplittedAttributes.js'
import registries from '../Registries.js';


class Style {
	/**
	 * @param {string} type  : 'p' || 'span'
	 * @param {string}selector  : CSS selector
	 * @param {object} attributes : AttrIface passive partial PropertiesList-Like (no methods, only significative keys defined)
	 */
	constructor(type, selector, attributes) {
		this.selectorsList = new CSSSelectorsList(attributes.selector || selector);
		this.compactedViewOnSelectorsList = new CSSSelectorSetBuffer(null, this.selectorsList);
		this.type = type;
		this.attrIFace = new AdvancedAttributesList(this.type, attributes);

		// Populate the masterStyleRegistry, from which we shall later retrieve
		// the optimized part of the style object, i.e the current CSS rule
		this.selectorsList.forEach(function (currentSelector) {
			//		console.log(this.compactedViewOnSelectorsList.getEntry(
			//				currentSelector.selectorStr
			//				// we unpack 16 and 32 bits integers in the CSSCompactedSelector type (in fact it's a MemorySingleBuffer)
			//				).get(
			//					CSSSelectorsList.prototype.optimizedSelectorBufferSchema.bufferUID.start,
			//					2
			//				));
			registries.style.set(
				this.compactedViewOnSelectorsList.getEntry(
					currentSelector.selectorStr
					// we unpack 16 and 32 bits integers in the CSSCompactedSelector type (in fact it's a MemorySingleBuffer)
				).get(
					CSSSelectorsList.prototype.optimizedSelectorBufferSchema.bufferUID.start,
					2
				),
				this
			);
		}, this);

	}
	/**
	 * 
	 * @returns {string}
	 */
	linearize() {
		var linearizedSelector = '';
		this.selectorsList.forEach(function (selector, key) {
			linearizedSelector += selector.selectorStr;
			if (key !== this.selectorsList.length - 1)
				linearizedSelector += ', ';
		}, this);
		linearizedSelector += ' { ' + '\n' + this.attrIFace.linearize() + '\n' + '}\n';
		// FIXME: this should loop on the selectors and interpolate with commas
		return linearizedSelector;
	}
	/**
	 * 
	 * @param {CSSStyleSheet} styleSheet 
	 */
	addToStyleSheet(styleSheet) {
		this.index = styleSheet.insertRule(this.linearize());
	}
	/**
	 * 
	 * @param {CSSStyleSheet} styleSheet 
	 */
	removeFromStyleSheet(styleSheet) {
		styleSheet.deleteRule(this.index);
	}
	/**
	 * 
	 * @param {Style} styleObj 
	 * @returns {AdvancedAttributesList}
	 */
	// TODO: OPTIMIZE
	copyAndMergeWithStyle(styleObj) {
		var attrIFaceCopy = new AdvancedAttributesList('FIXME:noType', this.attrIFace.getAllDefinedAttributes());
		attrIFaceCopy.setApply(styleObj);
		return attrIFaceCopy;
	}
}




export default Style;
