/**
 * @module StyleRule
 */

import Style from './Style.js';
import AdvancedAttributesList from './SplittedAttributes.js';



class StyleRule {
	/**
 	* @constructor StyleRule
	* @param {number} ruleIdx  
	* @param {Style} rawRule
	* @returns self
	*/
	constructor(ruleIdx, rawRule) {
		this.objectType = 'StyleRule';

		if (Object.prototype.toString.call(rawRule) !== '[object Object]') {
			console.warn(this.objectType, 'rawRule isn\'t an Object or no ruleIdx given : ' + rawRule + '. Returning...');
			return;
		}

		this.ruleIdx = ruleIdx || 0;
		this.selector = rawRule.selector;
		this.hasOverride = false;
		this.styleIFace = new Style(null, this.selector, this.getAttributes(rawRule));
		this.attrIFace = this.styleIFace.attrIFace;
		this.additionalAttributes = {};
		this.strRule = this.attrIFace.linearize();
	}
	/**
	 * @static
	 * @param {number} ruleIdx
	 * @param {string} selector
	 * @param {AdvancedAttributesList} attrIFace
	 * @returns {StyleRule}
	 */
	static fromAdvancedStyleAttributes(ruleIdx, selector, attrIFace) {
		var styleRule = new StyleRule(ruleIdx, { selector: selector });
		styleRule.styleIFace.attrIFace = attrIFace;
		styleRule.attrIFace = attrIFace;
		styleRule.strRule = styleRule.attrIFace.linearize();
		return styleRule;
	}
	/**
	 * @param {Style} rawRule
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
	 * @param {Style} rawRule
	 */
	setAttributes(rawRule) {
		for (let prop in rawRule) {
			if (prop !== 'selector')
				this.attrIFace.set(prop, rawRule[prop]);
		}
	}
	/**
	 * @returns {object}
	 */
	cloneAttributes() {
		return (new AdvancedAttributesList(this.attrIFace.getAllDefinedAttributes())).getAllDefinedAttributes();
	}
	/**
	 * @returns {string}
	 */
	populateStrRule() {
		this.strRule = this.styleIFace.linearize();
	}
	/**
	 * @param {string} attr
	 * @returns {string}
	 */
	getAttr(attr) {
		return this.attrIFace.get(attr);
	}
	/**
	 * @param {string} attr
	 * @param {string} value
	 */
	setAttr(attr, value) {
		this.attrIFace.set(attr, value);
	}
	/**
	 * @param {Style} rawRule
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
				this.attrIFace.set(attr, this.additionalAttributes[attr]);
			}
		}
	}
}




















module.exports = StyleRule;