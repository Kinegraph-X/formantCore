/**
 * Constructor AttributesList
 * 
 */


var CSSPropertyBuffer = require('src/editing/CSSPropertyBuffer');
var CSSPropertyDescriptors = require('src/editing/CSSPropertyDescriptors');
var CSSPropertySetBuffer = require('src/editing/CSSPropertySetBuffer');



class AttributesList {
	/**
	 * Constructor AttributesList
	 * This abstract type shall be used as a base for the "splitted" styles:
	 * "Inheritable" and "local" attributes are grouped in 4 different objects
	 * in the "style" type. This allows optimizations to decouple the "component" 
	 * from the DOM.
	 * 	=> see AdvancedAttributesListFactory()
	 * 
	 * @param attributes Object : passive partial AttributesList-Like (no methods, only significative keys defined)
	 */
	constructor(attributes) {
		if (typeof attributes === 'undefined')
			return this;
		// backward compatibility with the attributes list we defined in PHP,
		// and ported as the basic implementation of AttributesList (StyleAttributes.js)
		// TODO: explicitly type each CSS data-structure so they precisely reproduce
		// the CSS props we're currently supporting 
		if (typeof attributes === 'object' && Object.keys(attributes).length) {
			for (var prop in attributes) {
				if (attributes.hasOwnProperty(prop) && prop !== 'selector' && prop !== 'type')
					this[prop] = attributes[prop];
			};
		}
	}
	linearize() {
		var str = '', current = '', attrCount = Object.keys(this).length, c = 0;
		for (var prop in this) {
			c++;
			// may be a typed property
			if (typeof this[prop] === 'string')
				current = this[prop];

			str += prop.dromedarToHyphens() + ' : ' + current + ';';

			if (c !== attrCount)
				str += '\n';
		};
		return str;
	}
	getAttribute(attributeName) {
		return this[attributeName];
	}
	getAttributeAsCSSOM;
	getAttributeAsKeyValue;
	setAttribute;
	setAttributeFromCSSOM;
	setAttributeFromKeyValue;
}





/**
 * Construct. BaseClass SplittedAttributesListBaseClass
 * 
 * @param attributes Object : partial AttributesList-Like (only significative keys defined)
 */
var SplittedAttributesListBaseClass = function(attributes) {
	Object.defineProperty(this, 'CSSPropertySetBuffer', {value: new CSSPropertySetBuffer()});
	this.disambiguateAttributes(attributes);
}
SplittedAttributesListBaseClass.prototype = {};	//Object.create(AttributesList.prototype);
Object.defineProperty(SplittedAttributesListBaseClass.prototype, 'objectType', {value: 'SplittedAttributesListBaseClass'});
Object.defineProperty(SplittedAttributesListBaseClass.prototype, 'purpose', {value: 'VirtualAttributes' });	// virtual
Object.defineProperty(SplittedAttributesListBaseClass.prototype, 'VirtualAttributes', {value: [] });		// virtual
Object.defineProperty(SplittedAttributesListBaseClass.prototype, 'InheritedAttributes', {value: Object.keys(CSSPropertyDescriptors.splitted.inheritedAttributes)});
Object.defineProperty(SplittedAttributesListBaseClass.prototype, 'LocallyEffectiveAttributes', {value: Object.keys(CSSPropertyDescriptors.splitted.locallyEffectiveAttributes)});
Object.defineProperty(SplittedAttributesListBaseClass.prototype, 'BoxModelAttributes', {value: Object.keys(CSSPropertyDescriptors.splitted.boxModelAttributes)});
Object.defineProperty(SplittedAttributesListBaseClass.prototype, 'StrictlyLocalAttributes', {value: Object.keys(CSSPropertyDescriptors.splitted.strictlyLocalAttributes)});

/**
 * This function ignores attributes depending on the fact they pertain to a certain category of CSS props  :
 * 
 * InheritedAttributes,
 * BoxModelAttributes,
 * LocallyEffectiveAttributes,
 * StrictlyLocalAttributes
 * 
 * and assign the filtered ones to the embedded CSSPropertySetBuffer
 * 
 * It also logs a warning if we encounter a non-supported CSS prop
 * (for now, we're not aimed at supporting the entire spec)
 */
Object.defineProperty(SplittedAttributesListBaseClass.prototype, 'disambiguateAttributes', {
	value: function(attributes) {
		var self = this, definedAttributes = Object.keys(attributes), packedCSSProperty;
		
		for (var i = 0, l = definedAttributes.length; i < l; i++) {
			(function(attrIdx, attrName) {
				if (!CSSPropertyDescriptors.all[attrName]) {
					console.warn('Unsupported CSS Property:', attrName);
					return;
				}
				else if (self[self.purpose].indexOf(attrName) < 0)
					return;
					
				packedCSSProperty = new CSSPropertyBuffer(null, attrName);
				packedCSSProperty.setValue(
					attributes[attrName]
				);

				// Set the isInitialValue flag to false
				packedCSSProperty._buffer.set([0], CSSPropertyBuffer.prototype.bufferSchema.isInitialValue.start);
				
				self.CSSPropertySetBuffer.setPropFromBuffer(attrName, packedCSSProperty);
			})(i, definedAttributes[i]);
		}
	}
});








/**
 * @constructor InheritedAttributesList
 * @extends SplittedAttributesListBaseClass
 * @param attributes Object : partial AttributesList-Like (only significative keys defined)
 */
var InheritedAttributesList = function(attributes) {
	SplittedAttributesListBaseClass.call(this, attributes);
}
InheritedAttributesList.prototype = Object.create(SplittedAttributesListBaseClass.prototype);
Object.defineProperty(InheritedAttributesList.prototype, 'objectType', { value: 'InheritedAttributesList' });
Object.defineProperty(InheritedAttributesList.prototype, 'purpose', { value: 'InheritedAttributes' });


/**
 * @constructor LocallyEffectiveAttributesList
 * @extends SplittedAttributesListBaseClass
 * @param attributes Object : partial AttributesList-Like
 */
var LocallyEffectiveAttributesList = function(attributes) {
	SplittedAttributesListBaseClass.call(this, attributes);
}
LocallyEffectiveAttributesList.prototype = Object.create(SplittedAttributesListBaseClass.prototype);
Object.defineProperty(LocallyEffectiveAttributesList.prototype, 'objectType', { value: 'LocallyEffectiveAttributesList' });
Object.defineProperty(LocallyEffectiveAttributesList.prototype, 'purpose', { value: 'LocallyEffectiveAttributes' });


/**
 * @constructor boxModelAttributes
 * @extends SplittedAttributesListBaseClass
 * @param attributes Object : partial AttributesList-Like 
 */
var BoxModelAttributesList = function(attributes) {
	SplittedAttributesListBaseClass.call(this, attributes);
}
BoxModelAttributesList.prototype = Object.create(SplittedAttributesListBaseClass.prototype);
Object.defineProperty(BoxModelAttributesList.prototype, 'objectType', { value: 'BoxModelAttributesList' });
Object.defineProperty(BoxModelAttributesList.prototype, 'purpose', { value: 'BoxModelAttributes' });


/**
 * @constructor StrictlyLocalAttributes
 * @extends SplittedAttributesListBaseClass
 * @param attributes Object : partial AttributesList-Like
 */
var StrictlyLocalAttributesList = function(attributes) {
	SplittedAttributesListBaseClass.call(this, attributes);
}
StrictlyLocalAttributesList.prototype = Object.create(SplittedAttributesListBaseClass.prototype);
Object.defineProperty(StrictlyLocalAttributesList.prototype, 'objectType', { value: 'StrictlyLocalAttributesList' });
Object.defineProperty(StrictlyLocalAttributesList.prototype, 'purpose', { value: 'StrictlyLocalAttributes' });






















var AdvancedAttributesListFactory = function(attributes) {
	if ((typeof attributes === 'string' || !attributes) && Object.prototype.toString.call(arguments[1]) === '[object Object]')
		attributes = arguments[1];

	this.inheritedAttributes = new InheritedAttributesList(attributes);
	this.locallyEffectiveAttributes = new LocallyEffectiveAttributesList(attributes);
	this.boxModelAttributes = new BoxModelAttributesList(attributes);
	this.strictlyLocalAttributes = new StrictlyLocalAttributesList(attributes);
}
AdvancedAttributesListFactory.prototype = {}

Object.defineProperty(AdvancedAttributesListFactory.prototype, 'get', {
	value: function(attr) {
		var propBuffer;
		for (var propGroup in CSSPropertyDescriptors.splitted) {
			if (CSSPropertyDescriptors.splitted[propGroup][attr]) {
				return this[propGroup].CSSPropertySetBuffer.bufferedValueToString(attr);
			}
		}
	}
});
Object.defineProperty(AdvancedAttributesListFactory.prototype, 'set', {
	value: function(attr, value) {
		if (attr === 'borderLeft')
			console.log('setAttribute', value);
		
		var propBuffer;
		for (var propGroup in CSSPropertyDescriptors.splitted) {
			if (CSSPropertyDescriptors.splitted[propGroup][attr]) {
				propBuffer = new CSSPropertyBuffer();
				propBuffer.setValue(value);
				this[propGroup].CSSPropertySetBuffer.setPropFromBuffer(attr, propBuffer);
			}
		}
	}
});
// FIXME: should update all partial lists down the object
Object.defineProperty(AdvancedAttributesListFactory.prototype, 'setApply', {
	value: function(attrList) {
//		Object.entries(attrList).forEach(function(pair) {
//			this.stdAttributes.set(pair[0], pair[1]);
//		}, this);
	}
});
Object.defineProperty(AdvancedAttributesListFactory.prototype, 'getAllAttributes', {
	value: function() {
		var allAttributes = {};
		for (var attrGroup in this) {
			Object.assign(allAttributes, this[attrGroup].CSSPropertySetBuffer.getPropertyGroupAsAttributesList(attrGroup));
		}
		return allAttributes;
	}
});

Object.defineProperty(AdvancedAttributesListFactory.prototype, 'getAllDefinedAttributes', {
	value: function() {
		var allAttributes = {};
		for (var attrGroup in this) {
//			console.log(this[attrGroup].CSSPropertySetBuffer.getPropertyGroupAsAttributesList(attrGroup));
			Object.assign(allAttributes, this[attrGroup].CSSPropertySetBuffer.getDefinedPropertiesFromGroupAsAttributesList(attrGroup));
		}
//		console.log(allAttributes);
		return allAttributes;
	}
});

Object.defineProperty(AdvancedAttributesListFactory.prototype, 'linearize', {
	value: function() {
		return new AttributesList(this.getAllDefinedAttributes()).linearize();
	}
});

Object.defineProperty(AdvancedAttributesListFactory, 'fromAST', {
	value: function(ast) {
		var name, attrList = {};
		// ast is an array of declarations
		ast.forEach(function(declaration) {
			// YET CSSOM ? it seems...
			
			name = declaration.name.hyphensToDromedar();
			if (CSSPropertyDescriptors.all.hasOwnProperty(name)) {
				attrList[name] = declaration.value.reduce(AdvancedAttributesListFactory.flattenDeclarationValues, '');
			}
		});
//		console.log(attrList);
		return new AdvancedAttributesListFactory(attrList);
	}
});

// A callback for the Reducer we use as a hacky serializer for the objects we get from the CSS ast
Object.defineProperty(AdvancedAttributesListFactory, 'flattenDeclarationValues', {
	value: function(acc, item, key) {
		//			console.log(acc, key);
		acc += item.tokenType !== 'WHITESPACE'
			? (item.tokenType === 'COMMA'
				? ','
				: (item.tokenType === 'DIMENSION' || item.tokenType === 'NUMBER'
					? item.repr + (item.unit || '')
					: (item.tokenType === 'PERCENTAGE'
						? item.repr + '%'
						: (item.type === 'FUNCTION'		// NOT a DECLARATION (item.type): it's a high-level type
							? item.name + '(' + item.value.reduce(AdvancedAttributesListFactory.flattenDeclarationValues, '') + ')'
							: item.value)
					)
				)
			)
			: (acc.length ? ' ' : '');		// no leading space in resulting string CSS values
		//			console.log(acc);
		return acc;
	}
});







export default AdvancedAttributesListFactory;