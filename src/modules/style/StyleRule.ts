/**
 * @module StyleRule
 */

// ts-noCheck

import StyleIFace from './StyleIFace';
import CSSRuleAsBuffer from './CSSStyleRuleAsBuffer';
import {
	type AllCSSPropertyName,
	type AttributeList,
	type RawRule,
	type RawRuleKeys
} from './CSSPropertyDescriptors';



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
	ruleIdx : number;
	selector : string;
	hasOverride : boolean;
	styleIFace : StyleIFace;
	styleRuleAsBuffer : CSSRuleAsBuffer;
	additionalStyleAttributes : AttributeList = {} as AttributeList;
	strRule : string;

	/**
	* @param {number} ruleIdx  
	* @param {RawRule} rawRule
	* @returns self
	*/
	constructor(ruleIdx : number, rawRule : RawRule) {
		this.ruleIdx = ruleIdx || 0;
		this.selector = rawRule.selector;
		this.hasOverride = false;
		this.styleIFace = new StyleIFace('', this.selector, this.getAttributes(rawRule));
		this.styleRuleAsBuffer = this.styleIFace.styleRuleAsBuffer;
		this.strRule = this.styleRuleAsBuffer.linearize();
	}
	/**
	 * @static
	 * @param {number} ruleIdx
	 * @param {string} selector
	 * @param {CSSRuleAsBuffer} styleRuleAsBuffer
	 * @returns {StyleRule}
	 */
	static fromAdvancedStyleAttributes(
		ruleIdx : number,
		selector : string,
		styleRuleAsBuffer : CSSRuleAsBuffer
	) {
		const styleRule = new StyleRule(
			ruleIdx,
			{ selector: selector } as RawRule
		);
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
	 * @returns {AttributeList}
	 */
	getAttributes(rawRule : RawRule) {
		const attr = {} as RawRule;
		const attrNames = Object.keys(rawRule) as RawRuleKeys;
		attrNames.filter((attrName) => attrName !== 'selector').forEach((attrName) => {
			attr[attrName] = rawRule[attrName];
		});
		return attr;
	}
	/**
	 * @param {RawRule} rawRule
	 */
	setAttributes(rawRule : RawRule) {
		const attrNames = Object.keys(rawRule) as RawRuleKeys;
		attrNames.filter((attrName) => attrName !== 'selector').forEach((attrName) => {
			this.styleRuleAsBuffer.set(attrName, rawRule[attrName]);
		});
	}
	/**
	 * 
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
	 * @param {AllCSSPropertyName} attr
	 * @returns {string}
	 */
	getAttr(attr : AllCSSPropertyName) {
		return this.styleRuleAsBuffer.get(attr);
	}
	/**
	 * @param {AllCSSPropertyName} attr
	 * @param {string} value
	 */
	setAttr(
		attr : AllCSSPropertyName,
		value : string
	) {
		this.styleRuleAsBuffer.set(attr, value);
	}
	/**
	 * @param {AttributeList} rawRule
	 */
	safeMergeAttributes(rawRule : AttributeList) {
		const attrNames = Object.keys(rawRule) as RawRuleKeys;
		attrNames.filter((attrName) => attrName !== 'selector').forEach((attrName) => {
			this.additionalStyleAttributes[attrName] = rawRule[attrName];
		});
		this.hasOverride = true;
	}
	/**
	 * @returns {void}
	 */
	applyAdditionnalStyleAsOverride() {
		if (this.hasOverride) {
			const attrNames = Object.keys(this.additionalStyleAttributes) as RawRuleKeys;
			attrNames.filter((attrName) => attrName !== 'selector').forEach((attrName) => {
				this.styleRuleAsBuffer.set(attrName, this.additionalStyleAttributes[attrName]);
			});
		}
	}
}





export default StyleRule;