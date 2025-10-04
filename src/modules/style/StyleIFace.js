/**
* Stylesheets
*/
/**
 * @typedef {import('./Stylesheet.js').default} StyleSheet
 */
import CSSSelectorsList from './CSSSelectorsList.js'
import CSSSelectorSetBuffer from './CSSSelectorSetBuffer.js'
import CSSRuleAsBuffer from './CSSStyleRuleAsBuffer.js'
import registries from '../Registries.js';

/**
 * Manages a set of CSS selectors and associated attributes for a rule.
 *
 * Holds selectorsList and compactedViewOnSelectorsList for efficient mapping.
 * May registers itself in registries.style for each selector entry.
 * Provides linearize() to generate CSS rule text and addToStyleSheet / removeFromStyleSheet to manipulate StyleSheet.
 */
class StyleIFace {
	selectorsList;
	compactedViewOnSelectorsList;
	type;
	styleRuleAsBuffer;
	/** @type {number} */
	index = -1;
	/**
	 * @param {string} type  : 'p' || 'span'
	 * @param {string}selector  : CSS selector
	 * @param {{ [x: string]: string; }} attributes : styleRuleAsBuffer passive partial PropertiesList-Like (no methods, only significative keys defined)
	 */
	constructor(type, selector, attributes) {
		this.selectorsList = new CSSSelectorsList(attributes.selector || selector);
		this.compactedViewOnSelectorsList = new CSSSelectorSetBuffer(null, this.selectorsList);
		this.type = type;
		this.styleRuleAsBuffer = new CSSRuleAsBuffer(selector, attributes);
	}
	/**
	 * Populate the masterStyleRegistry, from which we shall later retrieve
	 * the optimized part of the style object, i.e the current CSS rule
	 */
	addToRegistry() {
		this.selectorsList.forEach(function (currentSelector) {
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
	 * Produces the CSS rule string for a Style instance by concatenating selectors and attributes.
	 *
	 * Implemented in Style.js as part of the Style class.
	 * Builds: selectorStr list + attributes via styleRuleAsBuffer.linearize().
	 * Used by StyleRule and Stylesheet to insert/update rules.
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
		linearizedSelector += ' { ' + '\n' + this.styleRuleAsBuffer.linearize() + '\n' + '}\n';
		return linearizedSelector;
	}
	/**
	 * It generates a CSS rule string using linearize() 
	 * and adds it to the provided stylesheet, 
	 * storing the resulting index for later removal.
	 *
	 * Side effects:
	 * Modifies the styleSheet by inserting a new CSS rule.
	 * Sets this.index to the integer index of the inserted rule, used later by removeFromStyleSheet.
	 *
	 * @param {StyleSheet} styleSheet 
	 */
	addToStyleSheet(styleSheet) {
		this.index = styleSheet.insertRule(this.linearize());
	}
	/**
	 * It removes the CSS rule from the provided stylesheet using the stored index.
	 *
	 * @param {StyleSheet} styleSheet 
	 */
	removeFromStyleSheet(styleSheet) {
		styleSheet.deleteRule(this.index);
	}
	/**
	 * It creates a copy of the current style object and merges it with the provided style object.
	 * @param {StyleIFace} styleObj 
	 * @returns {CSSRuleAsBuffer}
	 */
	// not implemented
	copyAndMergeWithStyle(styleObj) {
		var styleRuleAsBufferCopy = new CSSRuleAsBuffer('FIXME:noType', this.styleRuleAsBuffer.getAllDefinedAttributes());
		// styleRuleAsBufferCopy.setApply(styleObj);
		return styleRuleAsBufferCopy;
	}
}




export default StyleIFace;
