/**
 * @constructor AbstractStylesheet
 * 
 * @param {object} styleRules
 * @returns self
 */

// @ts-noCheck

import StyleRule from './StyleRule.js';
import CSSRuleAsBuffer from './CSSStyleRuleAsBuffer.js';

	
class Stylesheet {
	constructor(styleRules, name) {
		this.objectType = 'AbstractStylesheet';
		if (name)
			this.name = name;

		if (!Array.isArray(styleRules)) {
			console.warn(this.objectType, 'styleRules isn\'t an Array. Returning..., "', styleRules, '" has been received');
			return this;
		}

		this.length = 0;
		this.rules = {};
		this.currentAPI = new DOMStyleAPI(name);

		this.iterateOnRules(styleRules);
	}
	getName() {
		return this.currentAPI.getName();
	}
	getStyleNode() {
		return this.currentAPI.getStyleNode();
	}
	//AbstractStylesheet.prototype.export = function(defUID) {
	//	var cachedUnderUID = TypeManager.sWrappersCache.getItem(defUID);
	//	if (Object.prototype.toString.call(cachedUnderUID) === '[object Object]')
	//		return cachedUnderUID.clone();
	//	else {
	//		TypeManager.sWrappersCache.setItem(defUID, this);
	//		return this.clone()	
	//	}
	//}
	getProp(selector, prop) {
		return this.rules[selector].getAttr(prop);
	}
	setProp(selector, prop, value) {
		this.rules[selector].setAttr(prop, value);
		this.replaceRule(selector);
	}
	iterateOnRules(styleRules) {
		styleRules.forEach(function (rawRule) {
			this.addRule(rawRule);
		}, this);
	}
	newRule(rawRule) {
		if (rawRule instanceof CSSRuleAsBuffer) {
			var selector = rawRule.selector;
			delete rawRule.selector;
			return StyleRule.fromAdvancedStyleAttributes(this.length++, selector, rawRule);
		}

		else
			return new StyleRule(this.length++, rawRule);
	}
	deleteRule(selector) {
		delete this[selector];
		return --this.length;
	}
	addRule(rule, selector) {
		var sRule;
		if (!(rule instanceof StyleRule))
			sRule = this.newRule(rule);

		else
			sRule = rule;
		selector = rule.selector || sRule.selector || (rule.attrIFace && rule.attrIFace.selector) || selector;

		if (!selector) {
			console.warn('AbstractStylesheet: constructing a styleRule based on an empty selector', rule, 'Returning...');
			return;
		}
		this.rules[selector] = sRule;
	}
	addRules(rules) {
		if (!Array.isArray(rules)) {
			console.warn(this.objectType, 'addRules only accepts arrays. Returning...');
			return;
		}
		rules.forEach(function (rule) {
			this.addRule(rule);
		}, this);
	}
	updateRule(rawRule, selector) {
		selector = rawRule.selector || selector;
		this.rules[selector].setAttributes(rawRule);
		this.replaceRule(selector);
	}
	replaceRule(selector) {
		if (!this.rules[selector].strRule.length)
			return;
		var newStrRule = this.rules[selector].styleIFace.linearize();
		this.currentAPI.replaceRule(this.rules[selector].strRule, newStrRule);
		this.rules[selector].strRule = newStrRule;
	}
	removeRule(selector) {
		this.currentAPI.removeRule(this.rules[selector].strRule);
		this.deleteRule(selector);
	}
	overrideStyles(styleRules) {
		if (!styleRules || !Array.isArray(styleRules)) {
			console.warn(this.objectType, 'overrideStyles only accepts arrays.', styleRules === null ? 'null' : typeof styleRules, 'given. Returning...');
			return;
		}
		styleRules.forEach(function (rawRule) {
			if (rawRule.selector)
				this.safeMergeStyleRule(rawRule.selector, rawRule);
		}, this);
	}
	safeMergeStyleRule(selector, rawRule) {
		if (typeof this.rules[selector] !== 'undefined')
			this.rules[selector].safeMergeAttributes(rawRule);

		else
			this.addRule(rawRule, selector);
	}
	clone() {
		var styleRules = [];
		for (let selector in this.rules) {
			styleRules.push(
				Object.assign(
					this.rules[selector].cloneAttributes(),
					{ selector: selector }
				)
			);
			// HACK
			//		if (this.rules[selector].hasOverride) {
			//			console.log(this.objectType, selector, 'hasOverride : ', styleRules[styleRules.length - 1]);
			//			Object.assign(styleRules[styleRules.length - 1], this.rules[selector].additionalAttributes);
			//		}
		}
		if (!Array.isArray(styleRules))
			console.error(styleRules);
		return new Stylesheet(styleRules, this.currentAPI.getName());
	}
	shouldSerializeOne(selector) {
		if (this.rules[selector].strRule.length) {
			this.replaceRule(selector);
			return;
		}
		this.rules[selector].strRule = this.rules[selector].styleIFace.linearize();
		this.currentAPI.appendRule(this.rules[selector].strRule);
	}
	shouldSerializeAll() {
		var styleAsString = '';
		for (let selector in this.rules) {
			this.rules[selector].applyAdditionnalStyleAsOverride();
			styleAsString += (this.rules[selector].strRule = this.rules[selector].styleIFace.linearize());
		}
		this.currentAPI.setContent(styleAsString);
	}
}












class DOMStyleAPI {
	constructor(name) {
		this.styleElem = {}; // should be null
		name = this.getStyleElem(name); // cache temporary registration magic...
		this.styleElem.name = name;
		this.stylesheet = this.styleElem.sheet;
	}
	getStyleElem(name) {
		// HACK: before we generalize the API for style objects, there's only this one...
		//		=> don't try to get a stylElement if we're outside the browser
		if (typeof document === 'undefined' || typeof document.ownerDocument === 'undefined')
			return name;
		this.styleElem = document.createElement('style');
		return name;
	}
	getName() {
		return this.styleElem.name;
	}
	getStyleNode() {
		return this.styleElem;
	}
	appendRule(strRule) {
		this.styleElem.innerHTML += strRule;
	}
	setContent(strContent) {
		this.styleElem.innerHTML = strContent;
	}
	removeRule(strRule) {
		this.styleElem.innerHTML = this.styleElem.innerHTML.replace(strRule, '');
	}
	replaceRule(strRule, newStrRule) {
		this.styleElem.innerHTML = this.styleElem.innerHTML.replace(strRule, newStrRule);
	}
}





export default Stylesheet;
