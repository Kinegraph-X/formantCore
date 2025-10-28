import {ComponentError} from '../error/Error'
import StyleRule from './StyleRule';
import CSSRuleAsBuffer from './CSSStyleRuleAsBuffer';

import {
    type AllCSSPropertyName,
    type RawRule,
} from './CSSPropertyDescriptors';

/*
 * Port of Stylesheet.js → Stylesheet.ts
 *
 * The DOM-related API is kept permissive (uses `any`) so this module can run both in-browser and in non-DOM environments.
 */

class Stylesheet {
	static objectType = 'AbstractStylesheet';
	length: number = 0;
	rules: Record<string, StyleRule> = {};
	currentAPI: DOMStyleAPI;
	name?: string;

	constructor(styleRules: RawRule[], name?: string) {
		if (name) this.name = name;

		if (!Array.isArray(styleRules)) {
			throw new ComponentError(this, "styleRules isn't an Array. Returning...", '"', styleRules, '" has been received');
		}

		this.length = 0;
		this.rules = {};
		this.currentAPI = new DOMStyleAPI(name);

		this.iterateOnRules(styleRules);
	}

	getName(): string | undefined {
		return this.currentAPI.getName();
	}

	getStyleNode(): any {
		return this.currentAPI.getStyleNode();
	}

	getProp(selector: string, prop: AllCSSPropertyName) {
		return this.rules[selector].getAttr(prop);
	}

	setProp(selector: string, prop: AllCSSPropertyName, value: string) {
		this.rules[selector].setAttr(prop, value);
		this.replaceRule(selector);
	}

	iterateOnRules(styleRules: RawRule[]) {
		styleRules.forEach((rawRule) => {
			this.addRule(rawRule);
		});
	}

	newRule(rawRule: RawRule): StyleRule {
		if (rawRule instanceof CSSRuleAsBuffer) {
			const selector = rawRule.selector;
			// original JS deleted selector property on the buffer — keep it untouched here
			return StyleRule.fromAdvancedStyleAttributes(this.length++, selector, rawRule as CSSRuleAsBuffer);
		} else {
			return new StyleRule(this.length++, rawRule);
		}
	}

	deleteRule(selector: string) {
		delete this.rules[selector];
		return --this.length;
	}

	addRule(rule: RawRule|StyleRule, selector?: string) {
		let sRule: StyleRule;
		if (!(rule instanceof StyleRule)) {
            sRule = this.newRule(rule);
        }
		else { 
            sRule = rule;
        }

		selector = selector || sRule.selector;

		if (!selector) {
			console.warn('AbstractStylesheet: constructing a styleRule based on an empty selector', rule, 'Returning...');
			return;
		}

		this.rules[selector] = sRule;
	}

	addRules(rules: RawRule[]) {
		if (!Array.isArray(rules)) {
			console.warn(Stylesheet.objectType, 'addRules only accepts arrays. Returning...');
			return;
		}
		rules.forEach((rule) => this.addRule(rule));
	}

	updateRule(rawRule: RawRule, selector?: string) {
        selector = selector || rawRule.selector;
		this.rules[selector].setAttributes(rawRule);
		this.replaceRule(selector);
	}

	replaceRule(selector: string) {
		if (!this.rules[selector].strRule || !this.rules[selector].strRule.length) return;
		const newStrRule = this.rules[selector].styleIFace.linearize();
		this.currentAPI.replaceRule(this.rules[selector].strRule, newStrRule);
		this.rules[selector].strRule = newStrRule;
	}

	removeRule(selector: string) {
		this.currentAPI.removeRule(this.rules[selector].strRule);
		this.deleteRule(selector);
	}

	overrideStyles(styleRules: Array<RawRule>) {
		if (!styleRules || !Array.isArray(styleRules)) {
			console.warn(Stylesheet.objectType, 'overrideStyles only accepts arrays.', styleRules === null ? 'null' : typeof styleRules, 'given. Returning...');
			return;
		}
		styleRules.forEach((rawRule) => {
			if (rawRule.selector) this.safeMergeStyleRule(rawRule.selector, rawRule);
		});
	}

	safeMergeStyleRule(selector: string, rawRule: RawRule) {
		if (typeof this.rules[selector] !== 'undefined') this.rules[selector].safeMergeAttributes(rawRule);
		else this.addRule(rawRule, selector);
	}

	clone(): Stylesheet {
		const styleRules: RawRule[] = [];
		for (const selector in this.rules) {
			styleRules.push(Object.assign(this.rules[selector].cloneAttributes(), { selector }));
		}
		if (!Array.isArray(styleRules)) console.error(styleRules);
		return new Stylesheet(styleRules, this.currentAPI.getName());
	}

	shouldSerializeOne(selector: string) {
		if (this.rules[selector].strRule && this.rules[selector].strRule.length) {
			this.replaceRule(selector);
			return;
		}
		this.rules[selector].strRule = this.rules[selector].styleIFace.linearize();
		this.currentAPI.appendRule(this.rules[selector].strRule);
	}

	shouldSerializeAll() {
		let styleAsString = '';
		for (const selector in this.rules) {
			this.rules[selector].applyAdditionnalStyleAsOverride();
			styleAsString += (this.rules[selector].strRule = this.rules[selector].styleIFace.linearize());
		}
		this.currentAPI.setContent(styleAsString);
	}
}


class DOMStyleAPI {
	styleElem: HTMLStyleElement;
	stylesheet: CSSStyleSheet|null;

	constructor(name?: string) {
		this.styleElem = document.createElement('style');
        /** @ts-ignore name isn't standard */
		this.styleElem.name = name;
		this.stylesheet = this.styleElem.sheet;
	}

	getStyleElem(name?: string): string {
		// When outside a browser we keep a string name instead of a real element
		// if (typeof document === 'undefined' || typeof document.ownerDocument === 'undefined') return name;
		this.styleElem = document.createElement('style');
		return name || '';
	}

	getName(): string | undefined {
        /** @ts-ignore name isn't standard */
		return this.styleElem.name;
	}

	getStyleNode(): any {
		return this.styleElem;
	}

	appendRule(strRule: string) {
		if (this.styleElem && typeof this.styleElem.innerHTML === 'string') this.styleElem.innerHTML += strRule;
	}

	setContent(strContent: string) {
		if (this.styleElem && typeof this.styleElem.innerHTML === 'string') this.styleElem.innerHTML = strContent;
	}

	removeRule(strRule: string) {
		if (this.styleElem && typeof this.styleElem.innerHTML === 'string') this.styleElem.innerHTML = this.styleElem.innerHTML.replace(strRule, '');
	}

	replaceRule(strRule: string, newStrRule: string) {
		if (this.styleElem && typeof this.styleElem.innerHTML === 'string') this.styleElem.innerHTML = this.styleElem.innerHTML.replace(strRule, newStrRule);
	}
}


export default Stylesheet;
