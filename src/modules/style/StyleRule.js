/**
 * @module StyleRule
 */

import StyleIFace from './StyleIFace.js';
import CSSRuleAsBuffer from './CSSStyleRuleAsBuffer.js';

/**
 * @typedef {{[key: string]: string}} RawRule
 */

/**
 * A class representing a CSS style rule with structured attribute management.
 * It encapsulates selector-based styling data and provides methods 
 * to manipulate, merge, and serialize style properties efficiently.
 * 
 * Separating the selector from its associated style attributes,
 * it uses internal buffers (CSSRuleAsBuffer) to manage style declarations 
 * and supports advanced operations like safe merging and override application.
 * 
 * In practice, StyleRule is used by Stylesheet to manage collections of CSS rules. 
 * It supports both direct instantiation and creation from advanced buffer objects.
 * 
 * @example
 * Stylesheet.js #L60-64
 * newRule(rawRule) {
 *    if (rawRule instanceof CSSRuleAsBuffer) {
 *        var selector = rawRule.selector;
 *        delete rawRule.selector;
 *        return StyleRule.fromAdvancedStyleAttributes(this.length++, selector, rawRule);
 *    } else
 *        return new StyleRule(this.length++, rawRule);
 * }
 * 
 * 
 */
class StyleRule {
	static objectType = 'StyleRule';
	/**
	* @param {number} ruleIdx  
	* @param {RawRule} rawRule
	* @returns self
	*/
	constructor(ruleIdx, rawRule) {
		this.ruleIdx = ruleIdx || 0;
		this.selector = rawRule.selector;
		this.hasOverride = false;
		this.styleIFace = new StyleIFace(null, this.selector, this.getAttributes(rawRule));
		this.styleRuleAsBuffer = this.styleIFace.styleRuleAsBuffer;
		this.additionalAttributes = {};
		this.strRule = this.styleRuleAsBuffer.linearize();
	}
	/**
	 * @static
	 * @param {number} ruleIdx
	 * @param {string} selector
	 * @param {CSSRuleAsBuffer} styleRuleAsBuffer
	 * @returns {StyleRule}
	 */
	static fromAdvancedStyleAttributes(ruleIdx, selector, styleRuleAsBuffer) {
		var styleRule = new StyleRule(ruleIdx, { selector: selector });
		styleRule.styleIFace.styleRuleAsBuffer = styleRuleAsBuffer;
		styleRule.styleRuleAsBuffer = styleRuleAsBuffer;
		styleRule.strRule = styleRule.styleRuleAsBuffer.linearize();
		return styleRule;
	}
	/**
	 * extracts non-selector properties from a raw style rule object.
	 * It is used during the construction of a StyleRule instance 
	 * to isolate styling attributes from the selector field, 
	 * preparing them for use in a Style object.
	 * 
	 * @param {RawRule} rawRule
	 * @returns {object}
	 */
	getAttributes(rawRule) {
		var attr = {};
		for (let prop in rawRule) {
			if (prop !== 'selector')
				attr[prop] = rawRule[prop];
		}
		return attr;
	}
	/**
	 * @param {RawRule} rawRule
	 */
	setAttributes(rawRule) {
		for (let prop in rawRule) {
			if (prop !== 'selector')
				this.styleRuleAsBuffer.set(prop, rawRule[prop]);
		}
	}
	/**
	 * @returns {{[key: string]: string}}
	 */
	cloneAttributes() {
		return (new CSSRuleAsBuffer(this.selector, this.styleRuleAsBuffer.getAllDefinedAttributes())).getAllDefinedAttributes();
	}
	/**
	 * Populates the strRule property with the linearized style rule.
	 */
	populateStrRule() {
		this.strRule = this.styleIFace.linearize();
	}
	/**
	 * @param {string} attr
	 * @returns {string}
	 */
	getAttr(attr) {
		return this.styleRuleAsBuffer.get(attr);
	}
	/**
	 * @param {string} attr
	 * @param {string} value
	 */
	setAttr(attr, value) {
		this.styleRuleAsBuffer.set(attr, value);
	}
	/**
	 * @param {RawRule} rawRule
	 */
	safeMergeAttributes(rawRule) {
		for (let prop in rawRule) {
			this.additionalAttributes[prop] = rawRule[prop];
		}
		this.hasOverride = true;
	}
	/**
	 * @returns {void}
	 */
	applyAdditionnalStyleAsOverride() {
		if (this.hasOverride) {
			for (let attr in this.additionalAttributes) {
				this.styleRuleAsBuffer.set(attr, this.additionalAttributes[attr]);
			}
		}
	}
}





export default StyleRule;