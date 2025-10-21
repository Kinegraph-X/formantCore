/**
 * construct. CSSSelectorsList
 */

// ts-noCheck

import {hyphensToCamel, capitalizeFirstLetter} from '../nativeTypesUtilities/StringUtilities.js';
import {BinarySchemaFactory} from '../buffer/BinarySchema';
import CSSSimpleSelector from './CSSSimpleSelector';

import {
  splitter,
  hostPseudoFunction,
  attributesComponent,
  interestingTokens,
  typeIsCombinator,
  typeIsUniversal,
  typeIsId,
  typeIsClass,
  typeIsAttribute,
  typeIsHost,
  typeIsTag,
  hasPseudoClass,
  pseudoClassTypeFormat,
  pseudoClassMicroSyntaxFormat,
  shadowDOMHostSpecialKeyword,
} from './CSSSelectorComponentRegexes.js';

export const schemaProps = [	
	'startingOffsetInString',
	'stringLength',
	'stringBinaryEncoded',
	'selectorProofingPartType',
	'selectorHasPseudoClass',
	'selectorPseudoClassType',
	'reservedForFutureUse',
	'bufferUID',
] as const

/**
 * @constructor CSSSelectorsList
 */
class CSSSelectorsList extends Array{
	static objectType = 'CSSSelectorsList';
	static selectorAsBufferSchema = BinarySchemaFactory.createSchema(
		'compactedViewOnSelector',
		schemaProps,
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
	);

	/**
	 * @param {string} selectorAsStr 
	 */
	constructor(selectorAsStr : string) {
		super();
		var selectorsList;

		if (selectorAsStr.match(/,/)) {
			selectorsList = selectorAsStr.split(/,\s/);
			if (selectorsList === null) {
				console.warn('CSSSelectorsList: no actual selector could be identified. selectorAsStr is "' + selectorAsStr + '"');
				return;
			}
			selectorsList.forEach((selector) => {
				this.push(new CSSComplexSelector(selector));
			});
		}

		else
			this.push(new CSSComplexSelector(selectorAsStr));

	}
	// UTILITY FUNCTIONS: to be used when matching the selectors
	/**
	 * @param {number} DHL 
	 * @returns {string}
	 */
	DHLstr(DHL : number) {
		var ret = '';
		for (var i = 0, l = DHL; i < l; i++) {
			ret += '	';
		}
		return ret;
	}
	/**
	 * @param {...*} args 
	 */
	localDebugLog(...args : any) {
		//	console.log.apply(null, Array.prototype.slice.call(arguments));
	}
}





class CSSComplexSelector {
	static objectType = 'CSSSelector';
	constants = {
		rawSelectorIsProof : 0,
		idIsProof : 1,
		classIsProof : 2,
		tagIsProof : 3,
		hostIsProof : 4
	};
	selectorStr;
	components;
	selectorProofingPartType;
	rightMost;
	rightMostHasPseudoClassFlag;
	rightMostPseudoClassType;
	specificity;

	/**
	 * @param {string} selectorAsStr 
	 */
	constructor(selectorAsStr: string) {
		this.selectorStr = selectorAsStr;
		this.components = new CSSSimpleSelectorSequence(''); // Dummy object to avoid hidden-class transition
		this.selectorProofingPartType = 0;
		this.rightMost = this.extractMostSpecificPartFromSelector();
		
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
		this.components = new CSSSimpleSelectorSequence(this.selectorStr);
		this.specificity = this.components.getSpecificity();
		return this.cascadeOnSpecificity(this.components[this.components.length - 1].value);
	}
	/**
	 * @param {string} rightMost 
	 * @returns {string}
	 */
	cascadeOnSpecificity(rightMost : string) {
		var match;
		//	console.log(rightMost);
		//	(rightMost === ':host' && console.log(rightMost, match));
		match = rightMost.match(typeIsId);

		if (match) {
			this.selectorProofingPartType = this.constants.idIsProof;
			return match[1];
		}
		else {
			match = rightMost.match(typeIsClass);
			//		(rightMost === ':host' && console.log(rightMost, match));
			if (match) {
				this.selectorProofingPartType = this.constants.classIsProof;
				return match[1] || match[2];
			}
			else {
				match = rightMost.match(typeIsHost);
				//			(rightMost === ':host' && console.log(rightMost, match));
				if (match) {
					this.selectorProofingPartType = this.constants.hostIsProof;
					return match[0];
				}
				else {
					match = rightMost.match(typeIsTag);
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
		return this.components.	getSpecificity();
	}
}




















class CSSSimpleSelectorSequence extends Array {
	static objectType = 'CSSSelectorComponentList';
	specificity: number = 0;
	/**
	 * 
	 * @param {string} [selectorAsStr] 
	 * @returns 
	 */
	constructor(selectorAsStr : string) {
		super();
		if (!selectorAsStr)
			return;

		this.captureRelationship(selectorAsStr);

		this.specificity = this.getSpecificity()

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
	/**
	 * 
	 * @param {string} selectorAsStr 
	 */
	captureRelationship(selectorAsStr : string) {
		// TODO: Ensure we can't encounter a coma here, that would be a list of selectors
		const splitted = selectorAsStr.trim().split(splitter);
		let leftSibbling = splitted[0];
		
		splitted.forEach((rawComponent) => {
			if (!rawComponent.match(typeIsCombinator))
				this.push(new CSSSimpleSelector(rawComponent, leftSibbling));
			leftSibbling = rawComponent;
		});
	}
}
















class CSSSelectorComponentValues {
	static objectType = 'CSSSelectorComponentValues'
	idPart = '';
	tagPart = '';
	classPart : string[] = [];
	namePart = '';
	attributesPart;
	valuesCount;
	specificity;

	/**
	 * 
	 * @param {string} completeSelector 
	 * @param {string} [tagPart] 
	 * @param {string} [idPart] 
	 * @param {string[]} [classPart] 
	 */
	constructor(
		completeSelector : string,
		tagPart : string = '',
		idPart : string = '',
		classPart : string[] = []
	) {
		// FIXME: this.isolateAttributesSelectors won't support the case where we must match on 'startwith', 'includes', 'endWith'
		// ALSO: we haven't yet really implemented all the cases
		this.idPart = this.isolateAttributesSelectors(idPart || ''); // String
		this.classPart = this.isolateAttributesSelectors(classPart || []); // Array
		this.tagPart = this.isolateHostPseudoFunction(
			this.isolateAttributesSelectors(completeSelector || ''),
			tagPart
		); // String
		this.attributesPart = new SelectorComponentAttributesValues(); // Map (SelectorComponentAttributesValues)

		this.valuesCount = +(tagPart.length > 0) + (+(idPart.length > 0)) + (+(classPart.length > 0 && classPart.length));
		this.specificity = this.getSpecificity();
	}
	/**
	 * 
	 * @param {string} completeSelector 
	 * @param {string} [tagPart] 
	 * @returns 
	 */
	isolateHostPseudoFunction(completeSelector : string, tagPart : string) {
		var pseudoFunction, tmpCapture;
		if ((pseudoFunction = completeSelector.match(hostPseudoFunction))) {
			// WARNING: There's a risky recursion here, but this code seems to handle that correctly
			tmpCapture = CSSSimpleSelector.prototype.getCompoundValues(pseudoFunction[2]);
			this.classPart = tmpCapture.classPart;
			this.idPart = tmpCapture.idPart;
			return pseudoFunction[1];
		}
		return '';
	}
	/**
	 * 
	 * @param {string|string[]} componentPart 
	 * @returns 
	 */
	isolateAttributesSelectors(componentPart : string|string[]) {
		// We assume it's worth coding an optimization on the "attributes" selector:
		// 	=> if the attribute targets a class or an id with the "stricly equals" operator, we convert that "attribute" component
		var attribute, tmpCapture;
		// Case of the class part
		if (Array.isArray(componentPart) && componentPart.length > 0) {
			/** @type {number[]} */
			var indexesToRemove : number[]= [];
			// Due to the simplicity of our splitter, there may be an attribute part
			// on each classPart element:
			// 		=> try to match each time and store immediatly the modified classPart element
			// 		=> then, remove these classPart elements before merging the two arrays
			componentPart.forEach((classFragment, key) => {
				if ((attribute = classFragment.match(attributesComponent))) {
					// FIXME: matcher is not used => see constructor
					var type = attribute[2], 
						matcher = attribute[3],
						target = attribute[4];

					// TODO: implement the other attributes
					if (type === 'class') {
						this.classPart.push(target);
						indexesToRemove.push(key);
					}
					else if (type === 'id')
						this.idPart = target;
					else 
						this.attributesPart.set(type, target);

					this.classPart.push(attribute[1]);
				}
			});
			for (var i = componentPart.length - 1; i >= 0; i--) {
				if (indexesToRemove.indexOf(i) !== -1)
					componentPart.splice(i, 1);
			}
			return this.classPart.concat(componentPart);
		}

		// other cases
		else if (componentPart.length) {
			/** @ts-ignore tested above */
			if ((attribute = (componentPart.match)(attributesComponent))) {
				// FIXME: matcher is not used => see constructor
				var type = attribute[2], matcher = attribute[3], target = attribute[4];

				// TODO: implement the other attributes
				if (type === 'class')
					this.classPart.push(target);
				else 
					this.attributesPart.set(type, target);

				return attribute[1];
			}
			return [componentPart];
		}
		return [componentPart];
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
	name = '';
	checked = '';
	valid = '';
	selected = '';

	valuesCount = 0;

	constructor() {
		
	}
	/**
	 * @param {string} attrName
	 * @param {string} attrValue
	 */
	set(attrName : string, attrValue : string) {
		/** @ts-ignore not typeable: CSS rules come from a DB for now */
		this[attrName] = attrValue;
		this.countValues();
	};
	countValues() {
		this.valuesCount = 0;
		for (var attrName in this) {
			if (this[attrName])
				this.valuesCount++;
		}
	};
}


export default CSSSelectorsList;