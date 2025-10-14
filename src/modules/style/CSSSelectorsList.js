/**
 * construct. CSSSelectorsList
 */

// @ts-noCheck

import BinarySchemaFactory from '../buffer/BinarySchema.js';



/**
 * @constructor CSSSelectorsList
 */
class CSSSelectorsList extends Array{
	static objectType = 'CSSSelectorsList';
	/**
	 * @param {string} selectorAsStr 
	 */
	constructor(selectorAsStr) {
		super();
		var selectorsList;

		if (selectorAsStr.match(/,/)) {
			selectorsList = selectorAsStr.split(/,\s/);
			if (selectorsList === null) {
				console.warn('CSSSelectorsList: no actual selector could be identified. selectorAsStr is "' + selectorAsStr + '"');
				return;
			}
			selectorsList.forEach(function (selector) {
				this.push(new CSSSelector(selector));
			}, this);
		}

		else
			this.push(new CSSSelector(selectorAsStr));

	}
	// UTILITY FUNCTIONS: to be used when matching the selectors
	/**
	 * @param {number} DHL 
	 * @returns {string}
	 */
	DHLstr(DHL) {
		var ret = '';
		for (var i = 0, l = DHL; i < l; i++) {
			ret += '	';
		}
		return ret;
	}
	/**
	 * @param {...*} args 
	 */
	localDebugLog(...args) {
		//	console.log.apply(null, Array.prototype.slice.call(arguments));
	}
}


Object.defineProperty(CSSSelectorsList.prototype, 'optimizedSelectorBufferSchema', {
	value : BinarySchemaFactory(
		'compactedViewOnSelector',
		[	
			'startingOffsetInString',
			'stringLength',
			'stringBinaryEncoded',
			'selectorProofingPartType',
			'selectorHasPseudoClass',
			'selectorPseudoClassType',
			'reservedForFutureUse',
			'bufferUID',
		],
		[
			1,
			1,
			3,
			1,
			1,
			1,
			6,
			2
		]
	)
});









class CSSSelector {
	static objectType = 'CSSSelector';
	/**
	 * @param {string} selectorAsStr 
	 */
	constructor(selectorAsStr) {
		//TODO: A CSS selector may be a list of selectors
		//		=> instanciate a list by default
		this.selectorStr = selectorAsStr;
		this.components = new CSSSelectorComponentList(); // Dummy object to avoid hidden-class transition
		this.selectorProofingPartType = 0;
		this.rightMost = this.extractMostSpecificPartFromSelector();
		//	console.log(this.rightMost);
		this.rightMostHasPseudoClassFlag = this.components[this.components.length - 1].hasPseudoClassFlag;
		this.rightMostPseudoClassType = this.components[this.components.length - 1].pseudoClassType;
		this.specificity = this.getSpecificity();
	}
	/**
	 * @returns {string}
	 */
	toString() {
		return this.selectorStr;
	}
	/**
	 * @returns {string}
	 */
	extractMostSpecificPartFromSelector() {
		this.components = new CSSSelectorComponentList(this.selectorStr);
		this.specificity = this.components.specificity;
		return this.cascadeOnSpecificity(this.components[this.components.length - 1].value);
	}
	/**
	 * @param {string} rightMost 
	 * @returns {string}
	 */
	cascadeOnSpecificity(rightMost) {
		var match;
		//	console.log(rightMost);
		//	(rightMost === ':host' && console.log(rightMost, match));
		match = rightMost.match(this.typeIsId);

		if (match) {
			this.selectorProofingPartType = this.constants.idIsProof;
			return match[1];
		}
		else {
			match = rightMost.match(this.typeIsClass);
			//		(rightMost === ':host' && console.log(rightMost, match));
			if (match) {
				this.selectorProofingPartType = this.constants.classIsProof;
				return match[1] || match[2];
			}
			else {
				match = rightMost.match(this.typeIsHost);
				//			(rightMost === ':host' && console.log(rightMost, match));
				if (match) {
					this.selectorProofingPartType = this.constants.hostIsProof;
					return match[0];
				}
				else {
					match = rightMost.match(this.typeIsTag);
					//			(rightMost === ':host' && console.log(rightMost, match));
					if (match) {
						this.selectorProofingPartType = this.constants.tagIsProof;
						return match[0];
					}
				}
			}
		}

		return rightMost;
	}
	/**
	 * @returns {number}
	 */
	getSpecificity() {
		return this.components.specificity;
	}
}





CSSSelector.prototype.constants = {
	rawSelectorIsProof : 0,
	idIsProof : 1,
	classIsProof : 2,
	tagIsProof : 3,
	hostIsProof : 4
}















class CSSSelectorComponentList extends Array {
	static objectType = 'CSSSelectorComponentList';
	constructor(selectorAsStr) {
		if (!selectorAsStr)
			return;

		this.captureRelationship(selectorAsStr);

		Object.defineProperty(this, 'specificity', {
			value: this.getSpecificity()
		});

		if (!this.length)
			console.warn('CSSSelectorComponentList:', 'selectorAsStr => [' + selectorAsStr + ']', 'instanciation of the CSSSelectorComponentList failed.');
	}
	getSpecificity() {
		var specificity = 0;
		this.forEach(function(component) {
			specificity += component.getSpecificity();
		}, this);
		return specificity;
	}
	captureRelationship(selectorAsStr) {
		// TODO: Ensure we can't encounter a coma here, that would be a list of selectors
		var leftSibbling;
		var splitted = selectorAsStr.trim().split(CSSSelectorComponent.prototype.splitter);
		
		splitted.forEach(function(rawComponent) {
			if (!rawComponent.match(CSSSelectorComponent.prototype.typeIsCombinator))
				this.push(new CSSSelectorComponent(rawComponent, leftSibbling));
			leftSibbling = rawComponent;
		}, this);
	}
}
















class CSSSelectorComponent {
	static objectType = 'CSSSelectorComponent';
	/**
	 * 
	 * @param {string} componentAsStr 
	 * @param {string} leftSibbling 
	 * @returns 
	 */
	constructor(componentAsStr, leftSibbling) {
		var match;
		this.objectType = 'CSSSelectorComponent';

		this.value = componentAsStr;
		this.type = this.getType(componentAsStr);
		this.relation = this.getRelation(leftSibbling);

		this.compoundValues = this.getCompoundValues(componentAsStr);
		this.isCompound = this.compoundValues.valuesCount > 1;

		// FIXME: this code does not support having multiple pseudo-classes
		this.hasPseudoClassFlag = this.getHasPseudoClass(componentAsStr) || 0;
		this.pseudoClassMicroSyntax = [];
		this.pseudoClassType = (this.hasPseudoClassFlag && this.getPseudoClassConstant(componentAsStr)) || 0;

		this.hasAttributesFlag = this.getHasAttributes(componentAsStr) || 0;

		return (this.type && this.relation) || undefined;
	}
	/**
	 * 
	 * @param {string} componentAsStr 
	 * @returns 
	 */
	getType(componentAsStr) {
		// TODO: this MUST return a value qualifying ONLY the first part of the component (poorly tested till then)
		if (this.typeIsId.test(componentAsStr))
			return this.typeConstants.idType;
		else if (this.typeIsClass.test(componentAsStr))
			return this.typeConstants.classType;
		else if (this.typeIsAttribute.test(componentAsStr))
			return this.typeConstants.attributeType;
		else if (this.typeIsTag.test(componentAsStr))
			return this.typeConstants.tagType;
		else if (this.typeIsHost.test(componentAsStr))
			return this.typeConstants.hostType;
		else if (this.typeIsUniversal.test(componentAsStr))
			return this.typeConstants.universalType;
		else {
			//		console.warn('CSSSelectorComponent:', 'unknown type case should not be reachable.');
			return this.relationConstants.unknownType;
		}
	}
	/**
	 * 
	 * @param {string} componentAsStr 
	 * @returns 
	 */
	getHasPseudoClass(componentAsStr) {
		//	console.log(componentAsStr);
		return +(this.hasPseudoClass.test(componentAsStr) && !this.typeIsHost.test(componentAsStr));
	}
	/**
	 * 
	 * @param {string} componentAsStr 
	 * @returns 
	 */
	getHasAttributes(componentAsStr) {
		//	console.log(componentAsStr);
		return this.attributesComponent.test(componentAsStr);
	}
	/**
	 * 
	 * @param {string} componentAsStr 
	 * @returns 
	 */
	getPseudoClassConstant(componentAsStr) {
		var match;

		if ((match = componentAsStr.match(this.pseudoClassTypeFormat)) && match.length >= 4) {
			this.isCompound = true;
			var newComponentAsStr = match[1] + (match[4] || '');
			this.compoundValues = this.getCompoundValues(newComponentAsStr);

			var microSyntax;
			if ((microSyntax = match[3].match(this.pseudoClassMicroSyntaxFormat)) && microSyntax[0]) {
				this.pseudoClassMicroSyntax = [microSyntax[1] ? parseInt(microSyntax[1].slice(0, -1)) : 0, microSyntax[3] ? parseInt(microSyntax[3]) : 0];
				return this.pseudoClassConstants[match[2].hyphensToDromedar() + 'ANpB'];
			}

			return this.pseudoClassConstants[match[2].hyphensToDromedar() + match[3].capitalizeFirstChar()];
		}

		else
			return this.pseudoClassConstants['unknown'];
	}
	/**
	 * 
	 * @param {string} leftSibbling 
	 * @returns 
	 */
	getRelation(leftSibbling) {
		if (!leftSibbling)
			return this.relationConstants.none;
		else if (this.isValidComponent(leftSibbling))
			return this.relationConstants.descendant;
		else if (leftSibbling === this.interestingTokens.immediateDescendantToken)
			return this.relationConstants.immediateDescendant;
		else if (leftSibbling === this.interestingTokens.immediateNextSibblingToken)
			return this.relationConstants.immediateNextSibbling;
		else if (leftSibbling === this.interestingTokens.anyForwardSibblingToken)
			return this.relationConstants.anyForwardSibbling;
		else {
			console.warn('CSSSelectorComponent,', 'unsupported relation : leftSibbling is /' + leftSibbling + '/,', 'that case should not be reachable. (possible parsing error on our side)');
			return this.relationConstants.unknown;
		}
	}
	/**
	 * 
	 * @param {string} selectorAsStr 
	 * @returns 
	 */
	getCompoundValues(selectorAsStr) {
		var classPart1, classPart2;
		var splittedOnId = selectorAsStr.split('#');
		var tagPart = (classPart1 = splittedOnId[0].split('.')) && classPart1.shift();
		var idPart = (splittedOnId.length > 1 && (classPart2 = splittedOnId[1].split('.')).shift());
		var classPart = classPart2 ? classPart1.concat(classPart2) : classPart1;

		return (new CSSSelectorComponentValues(selectorAsStr, tagPart, idPart, classPart));
	}
	/**
	 * 
	 * @returns 
	 */
	getSpecificity() {
		var simpleSpecificity, compoundSpecificity;
		if (this.isCompound) {
			compoundSpecificity = this.compoundValues.getSpecificity();
			// FIXME: There may be multiple pseudo-classes
			if (this.hasPseudoClassFlag)
				return compoundSpecificity | (1 << 8);

			else
				return compoundSpecificity;
		}
		else {
			if (this.type === this.typeConstants.idType)
				simpleSpecificity = 1 << 16;
			if (this.type === this.typeConstants.classType || this.type === this.typeConstants.attributeType)
				simpleSpecificity = 1 << 8;
			if (this.type === this.typeConstants.tagType || this.type === this.typeConstants.hostType)
				simpleSpecificity = 1;
			// FIXME: There may be multiple pseudo-classes
			if (this.hasPseudoClassFlag)
				return simpleSpecificity | (1 << 8);

			else
				return simpleSpecificity;
		}
	}
	/**
	 * 
	 * @param {string} leftSibbling 
	 * @returns 
	 */
	isValidComponent(leftSibbling) {
		// HACK: could we really rely on the fact that a component
		// is valid if it can be resolved to a known type ? 
		return this.getType(leftSibbling);
	}
}

CSSSelectorComponent.prototype.splitter = /\s/;
CSSSelectorComponent.prototype.hostPseudoFunction = /^(:host)\((.+?)\)/;
CSSSelectorComponent.prototype.attributesComponent = /^(\w+?)\[(\w+?)([=~^]+?)(.+?)\]/;

CSSSelectorComponent.prototype.shadowDOMHostSpecialKeyword = ':host';

// /\w/ matches on alphaNum AND underscore
CSSSelectorComponent.prototype.typeIsCombinator = /^[>~+]/;
CSSSelectorComponent.prototype.typeIsUniversal = /^\*$/;
CSSSelectorComponent.prototype.typeIsId = /^#(\w+)/;
CSSSelectorComponent.prototype.typeIsClass = /^\.([\w-]+)|\[class.?="([\w-]+)"\]/;
CSSSelectorComponent.prototype.typeIsAttribute = CSSSelectorComponent.prototype.attributesComponent;
CSSSelectorComponent.prototype.typeIsHost = /^:host/;	// we removed the $ flag, cause it failed in getType() with :host(.class-name) (but if I remeber well, we had added the $ because it failed in other cases, but which?) 
CSSSelectorComponent.prototype.typeIsTag = /^(?<![\.#\:])[\w_-]+/;		 // Negative lookbehind : (?<!...)

CSSSelectorComponent.prototype.hasPseudoClass = /(?<=[^:]):[\w-]+/;
CSSSelectorComponent.prototype.pseudoClassTypeFormat = /(.+?):([\w-]+?)\(([\wn+-]+?)\)(.+)?/;
CSSSelectorComponent.prototype.pseudoClassMicroSyntaxFormat = /(-?[0-9]n\s?)?\s?([+-]?\s?(-?[0-9]*))?/;









CSSSelectorComponent.prototype.interestingTokens = {
	immediateDescendantToken : '>',
	immediateNextSibblingToken : '+',
	anyForwardSibblingToken : '~'
}

CSSSelectorComponent.prototype.typeConstants = {
	unknownType : 0,
	universalType : 1,
	idType : 2,
	classType : 3,
	attributeType : 4,
	tagType : 5,
	hostType : 6
}

CSSSelectorComponent.prototype.relationConstants = {
	unknown : 0,
	none : 1,
	descendant : 2,
	immediateDescendant : 3,
	immediateNextSibbling : 4,
	anyForwardSibbling : 5
}

CSSSelectorComponent.prototype.pseudoClassConstants = {
	unknown : 0,
	firstChild : 1,
	lastChild : 2,
	nthChildOdd : 3,
	nthChildEven : 4,
	nthChildANpB : 5,
}












class CSSSelectorComponentValues {
	static objectType = 'CSSSelectorComponentValues'
	/**
	 * 
	 * @param {string} completeSelector 
	 * @param {string} tagPart 
	 * @param {string} idPart 
	 * @param {string} classPart 
	 */
	constructor(completeSelector, tagPart, idPart, classPart) {
		// FIXME: this.isolateAttributesSelectors won't support the case where we must match on 'startwith', 'includes', 'endWith'
		// ALSO: we haven't yet really implemented all the cases
		this.objectType = '';
		this.idPart = ''; this.classPart = []; this.tagPart = ''; this.namePart = '';
		this.idPart = this.isolateAttributesSelectors(idPart || ''); // String
		this.classPart = this.isolateAttributesSelectors(classPart || []); // Array
		this.tagPart = this.isolateHostPseudoFunction(
			this.isolateAttributesSelectors(completeSelector || ''),
			tagPart
		); // String
		this.attributesPart = new SelectorComponentAttributesValues(); // Map (SelectorComponentAttributesValues)

		this.valuesCount = +(tagPart.length > 0) + (+(idPart.length > 0)) + (+(classPart.length > 0 && classPart.length));
		this.specificity = this.getSpecificity();
		//	console.log(completeSelector, this.idPart, this.idPart, this.classPart, this.tagPart)
	}
	/**
	 * 
	 * @param {string} completeSelector 
	 * @param {string} tagPart 
	 * @returns 
	 */
	isolateHostPseudoFunction(completeSelector, tagPart) {
		var pseudoFunction, tmpCapture;
		if ((pseudoFunction = completeSelector.match(CSSSelectorComponent.prototype.hostPseudoFunction))) {
			// WARNING: There's a risky recursion here, but this code seems to handle that correctly
			tmpCapture = CSSSelectorComponent.prototype.getCompoundValues(pseudoFunction[2]);
			this.classPart = tmpCapture.classPart;
			this.idPart = tmpCapture.idPart;
			return pseudoFunction[1];
		}
		return tagPart;
	}
	/**
	 * 
	 * @param {string} componentPart 
	 * @returns 
	 */
	isolateAttributesSelectors(componentPart) {
		// We assume it's worth coding an optimization on the "attributes" selector:
		// 	=> if the attribute targets a class or an id with the "stricly equals" operator, we convert that "attribute" component
		var attribute, tmpCapture;
		// Case of the class part
		if (Array.isArray(componentPart) && componentPart.length > 0) {
			var indexesToRemove = [];
			// Due to the simplicity of our splitter, there may be an attribute part
			// on each classPart element:
			// 		=> try to match each time and store immediatly the modified classPart element
			// 		=> then, remove these classPart elements before merging the two arrays
			componentPart.forEach(function (classFragment, key) {
				if ((attribute = classFragment.match(CSSSelectorComponent.prototype.attributesComponent))) {
					// FIXME: matcher is not used => see constructor
					var type = attribute[2], matcher = attribute[3], target = attribute[4];

					// TODO: implement the other attributes
					if (type === 'class') {
						this.classPart.push(target);
						indexesToRemove.push(key);
					}
					else if (type === 'id')
						this.idPart = target;
					else if (name === 'name')
						this.attributesPart.set('name', target);
					else if (name === 'checked')
						this.attributesPart.set('checked', target);
					else if (name === 'valid')
						this.attributesPart.set('valid', target);
					else if (name === 'selected')
						this.attributesPart.set('selected', target);

					this.classPart.push(attribute[1]);
				}
			}, this);
			for (var i = componentPart.length - 1; i >= 0; i--) {
				if (indexesToRemove.indexOf(i) !== -1)
					componentPart.splice(i, 1);
			}
			return this.classPart.concat(componentPart);
		}

		// other cases
		else if (componentPart.length) {
			if ((attribute = componentPart.match(CSSSelectorComponent.prototype.attributesComponent))) {
				// FIXME: matcher is not used => see constructor
				var type = attribute[2], matcher = attribute[3], target = attribute[4];

				// TODO: implement the other attributes
				if (type === 'class')
					this.classPart.push(target);
				else if (type === 'id')
					this.idPart = target;
				else if (name === 'name')
					this.attributesPart.set('name', target);
				else if (name === 'checked')
					this.attributesPart.set('checked', target);
				else if (name === 'valid')
					this.attributesPart.set('valid', target);
				else if (name === 'selected')
					this.attributesPart.set('selected', target);

				return attribute[1];
			}
			return componentPart;
		}
		return componentPart;
	}
	/**
	 * 
	 * @returns 
	 */
	getSpecificity() {
		var A = 0, B = 0, C = 0;

		A = +(this.idPart.length > 0);
		B = this.classPart.length + this.attributesPart.valuesCount;
		C = +(this.tagPart.length > 0);
		//	console.log('A', A, 'B', B, 'C', C);
		//	console.log('ABC', (A << 16) | (B << 8) | (C));
		return (A << 16) | (B << 8) | (C);
	}
}










class SelectorComponentAttributesValues {
	static objectType = 'SelectorComponentAttributesValues';
	constructor() {
		this.name = '';
		this.checked = '';
		this.valid = '';
		this.selected = '';

		Object.defineProperty(this, 'valuesCount', { value: 0 });
	}
	set;
	countValues;
}








CSSSelector.prototype.typeIsUniversal = CSSSelectorComponent.prototype.typeIsUniversal;
CSSSelector.prototype.typeIsId = CSSSelectorComponent.prototype.typeIsId;
CSSSelector.prototype.typeIsClass = CSSSelectorComponent.prototype.typeIsClass;
CSSSelector.prototype.typeIsTag = CSSSelectorComponent.prototype.typeIsTag;
CSSSelector.prototype.typeIsHost = CSSSelectorComponent.prototype.typeIsHost;

CSSSelectorsList.prototype.constants = CSSSelector.prototype.constants;
CSSSelectorsList.prototype.interestingTokens = CSSSelectorComponent.prototype.interestingTokens;
CSSSelectorsList.prototype.typeConstants = CSSSelectorComponent.prototype.typeConstants;
CSSSelectorsList.prototype.relationConstants = CSSSelectorComponent.prototype.relationConstants;
CSSSelectorsList.prototype.pseudoClassConstants = CSSSelectorComponent.prototype.pseudoClassConstants;

CSSSelectorsList.prototype.shadowDOMHostSpecialKeyword = CSSSelectorComponent.prototype.shadowDOMHostSpecialKeyword;

export default CSSSelectorsList;