/**
 * @constructor CSSPropertyBuffer
 */


import BinarySchemaFactory from '../buffer/BinarySchema.js';
import parser from '../../third-party/css-parser_forked_normalized.js';
import {generatorFor16bitsInt} from '../UIDGenerator.js'
/**
 * CSSPropertyBuffer is a binary-backed container 
 * for storing and manipulating individual CSS property values
 * 
 * It is used in CSSPropertySetBuffer to store the value of a CSS property.
 * 
 * It uses a fixed-size Uint8Array buffer to represent 
 * CSS values (like 12px, red, bold) as structured binary data, 
 * enabling fast serialization, comparison, and memory alignment
 * especially important in layout and rendering systems where 
 * thousands of style values are processed.
 * 
 * String Handling: Stores string representations (e.g., "10px") 
 * as fixed-length char code arrays (up to 89 chars via stdStrLength)
 * 
 * Only supports integers (not floats), 
 * with a FIXME noting that flexGrow, em, and other float-based values
 * are currently truncated
 * 
 * - Token Types: Uses a lookup table (TokenTypes) to convert parser tokens 
 * (e.g., IDENT, NUMBER, FUNCTION) into numeric constants for storage
 * 
 * - Value Types: Includes types like integer, percentage, float, hash, string
 * 
 * - Units: Stores units (e.g., px, em, %) as numeric constants
 * 
 * - Initial Value: Tracks whether the property is set to its initial value
 * 
 * Used primarily within CSSPropertySetBuffer to manage collections of CSS properties 
 * It is instantiated both during initialization and runtime style updates
 * 
 * *Real Example*: Setting a CSS Property in SplittedAttributes.js
 * SplittedAttributes.js #L111-119
 * packedCSSProperty = new CSSPropertyBuffer(null, attrName);
 * packedCSSProperty.setValue(attributes[attrName]);
 * packedCSSProperty._buffer.set([0], CSSPropertyBuffer.prototype.bufferSchema.isInitialValue.start);
 * self.CSSPropertySetBuffer.setPropFromShorthand(attrName, packedCSSProperty);
 * 
 * *Real Example*: Retrieving a Property in CSSPropertySetBuffer.getProp
 * CSSPropertySetBuffer.js #L84-88
 * var propAsBuffer = new CSSPropertyBuffer(
 *     this._buffer.slice(posForProp, posForProp + this.itemSize),
 *     propName
 * );
return propAsBuffer;
 */
class CSSPropertyBuffer {
	static objectType = 'CSSPropertyBuffer';
	static bufferSchema = BinarySchemaFactory.createSchema(
		'compactedViewOnProperty',
		[
			'tokenType',
			'propertyValue',
			'propertyType',
			'repr',
			'reprLength',
			'unit',
			'isInitialValue'
		],
		[
			1,
			2,
			1,
			CSSPropertyBuffer.prototype.stdStrLength,		// defining a tight limit to the size of the representation of a string is obviously a strong opinion: lets keep some neurons on it)
			1,
			1,
			1
		]
	);
	/**
	 * @param {object} initialLoad 
	 * @param {string} propName 
	 */
	constructor(initialLoad, propName) {
		this.objectType = 'CSSPropertyBuffer';
		this.propName = propName;
		this._buffer = new Uint8Array(initialLoad || this.bufferSchema.size);
	}
	/**
	 * @param {Array} value 
	 */
	setValue(value) {

		// For now, we haven't yet populated the initlaValue for each CSSPropertyDescriptor.
		// So this function is very frequently called with an empty array
		if (!value.length)
			return;

		var valueAsParsed, tokenType, concatVal;
		// if the property is a shorthand property, or if the property may be abbreviated,
		// we concatenate back
		// => shorthands are then handled (expanded) in CSSPropertySetBuffer.setPropFromShorthand()
		// => abbreviated props are also handled (in a branch) of CSSPropertySetBuffer.setPropFromShorthand()
		if (!/\s/.test(value.trim())) {
			var parsedValue = parser.parseAListOfComponentValues(value.trim());
			if (!parsedValue.length)
				return;
			tokenType = Object.getPrototypeOf(parsedValue[0]).tokenType.capitalizeFirstChar() + 'Token';

			if (tokenType === 'FunctionToken') {
				valueAsParsed = this.functionToCanonical(parsedValue[0]);
			}

			else
				valueAsParsed = parsedValue[0];
		}
		else {
			concatVal = value.trim();
			tokenType = 'NonparsedToken';

			// Concatenated values are typed as "Non Parsed",
			// and then, the valueAsParsed only has a repr property.
			valueAsParsed = new (
				LocalTokenFromParserFactory(null, 'NONPARSED')
			)(
				tokenType,
				null,
				null,
				'string',
				concatVal
			);
		}

		this.populate(tokenType, valueAsParsed);
	}
	// WON'T WORK FOR RELATIVE DIMENSIONS,
	// as, for example, we have no clue of the value of the inherited font-size property for the current property
	//CSSPropertyBuffer.prototype.unitToCanonical = function(valueAsParsed) {
	//	switch(valueAsParsed.unit) {
	//		case 'em' : 
	//			console.log("EM FOUND");
	//			break;
	//		default :
	//			break;
	//	}
	//	
	//	return valueAsParsed;
	//}
	/**
	 * param is token from parser
	 * @param {object} valueAsParsed 
	 */
	functionToCanonical(valueAsParsed) {
		var value, tokenTypeFromParser;
		if (valueAsParsed.name === 'rgb' || valueAsParsed.name === 'rgba') {
			//		console.log('rgb found');
			value = new (LocalTokenFromParserFactory(null, 'HASH'))();
			value.type = 'hash';
			value.repr = '#';
			valueAsParsed.value.forEach(function (val) {
				tokenTypeFromParser = Object.getPrototypeOf(val).tokenType;
				if (tokenTypeFromParser === "WHITESPACE" || tokenTypeFromParser === "COMMA")
					return;

				else
					value.repr += parseInt(val.value).toString(16).padStart(2, '0');
			}, this);
			//		console.log(value)
			return value;
		}
		else {
			// As for now, "format" and "local" are seen as unsupported functions
			if ((valueAsParsed.name === 'format' || valueAsParsed.name === 'local')
				|| (valueAsParsed.name === 'animation' || valueAsParsed.name === 'animationName' || valueAsParsed.name === 'animationDuration' || valueAsParsed.name === 'animationIterationCount' || valueAsParsed.name === 'animationIterationFunction' || valueAsParsed.name === 'animationDelay'))
				return new (LocalTokenFromParserFactory(null, 'UNDEFINED'))();
			else if (valueAsParsed.name === 'url') {
				value = new (LocalTokenFromParserFactory(null, 'URL'))();
				value.type = 'url';
				value.repr = 'url("';
				valueAsParsed.value.forEach(function (val) {
					value.repr += val.repr;
				});
				value.repr += '")';
				return value;
			}

			console.warn('CSSPropertyBuffer->functionToCanonical: unsupported function given (' + valueAsParsed.name + ').');
			return new (LocalTokenFromParserFactory(null, 'UNDEFINED'))();
		}
	}
	/**
	 * @param {string} tokenType 
	 * @param {object} value 
	 */
	populate(tokenType, value) {
		// the buffer size : 64 bytes buffers shall align well on a 2048KB L2 CPU cache
		// 16 bits values have to be declared as byte-tuples ([1, 0] would then represent 1, as all CPU's are now little-endian) 
		// (generatorFor16bitsInt, responsible for the UID, shall return an array)

		var normalizedValue = value; 
		if (typeof normalizedValue.repr === 'undefined')
			console.error('normalizedValue', normalizedValue);
		var strVal = normalizedValue.repr, strLength = strVal.length, strBuf = strVal.getNcharsAsCharCodesArray(this.stdStrLength, 0)[1], valueBuf = generatorFor16bitsInt.intFromNumber(normalizedValue.value);

		//	console.log('POPULATE', strVal, strBuf, value);
		// this.TokenTypes[tokenType] is the TokenType from the parser
		// represented as a numeric constant
		this._buffer.set(
			[this.TokenTypes[tokenType]],
			this.bufferSchema.tokenType.start
		);
		// value type
		var valueTypeAsConst = this.ValueTypes[value.type];
		this._buffer.set(
			[valueTypeAsConst],
			this.bufferSchema.propertyType.start
		);
		// value
		// FIXME: floats are NOT handled by our CSSPropertyBuffer type,
		// and flexGrow, font[em], and even dimensions may be float
		// For now, it acts like if we had parseInt the number
		this._buffer.set(
			valueBuf,
			this.bufferSchema.propertyValue.start
		);
		// representation
		this._buffer.set(
			strBuf,
			this.bufferSchema.repr.start
		);
		// representation string length
		this._buffer.set(
			[strVal.length],
			this.bufferSchema.reprLength.start
		);
		// unit
		this._buffer.set(
			[value.unit ? this.Units[value.unit].idx : 0],
			this.bufferSchema.unit.start
		);
	}
	/**
	 * 
	 * @param {string} singleValueAsString 
	 */
	parseAndSetValue(singleValueAsString) {
		var parsedValue;
		if ((parsedValue = this.parseValue(singleValueAsString)).length)
			this.setValue(parsedValue);
	}
	/**
	 * 
	 * @param {string} singleValueAsString 
	 */
	parseValue(singleValueAsString) {
		return parser.parseAListOfComponentValues(singleValueAsString);
	}
	/**
	 * parsed value is token from parser
	 * @param {object} parsedValue 
	 */
	fixValueFromParser(parsedValue) {
		return (new (LocalTokenFromParserFactory(parsedValue, Object.getPrototypeOf(parsedValue).tokenType))(
			null,
			parsedValue.value,
			parsedValue.name,
			parsedValue.type,
			parsedValue.repr,
			parsedValue.unit
		)
		);
	}
	/**
	 * parsed value is token from parser
	 * @param {object} parsedValue 
	 */
	concatenateBackFromParser(parsedValue) {
		var tokenTypeFromParser;
		var concatVal = '';
		parsedValue.forEach(function (val) {
			tokenTypeFromParser = Object.getPrototypeOf(val).tokenType;
			switch (tokenTypeFromParser) {
				case 'WHITESPACE':
					concatVal += ' ';
					break;
				case 'PERCENTAGE':
					concatVal += val.repr + '%';
					break;
				case 'HASH':
					concatVal += val.value ? '#' + val.value : val.repr;
					break;
				case 'COMMA':
					concatVal += ',';
					break;
				case 'FUNCTION':
					concatVal += this.functionToCanonical(val).repr;
				case 'OPENPAREN':
					concatVal += '(';
					break;
				case 'CLOSEPAREN':
					concatVal += ')';
					break;
				default: concatVal += typeof val.repr !== 'undefined' ? val.repr + this.Units[val.unit || ''].unit : val.value.toString() + this.Units[val.Units || ''].unit;
			}
		}, this);
		return concatVal;
	}
	/**
	 * 
	 * @returns {number}
	 */
	getIsInitialValue() {
		return this._buffer[this.bufferSchema.isInitialValue.start];
	}
	/**
	 * 
	 * @returns {boolean}
	 */
	getIsInitialValueAsBool() {
		return !!this._buffer[this.bufferSchema.isInitialValue.start];
	}
	/**
	 * 
	 */
	setIsInitialValue() {
		this._buffer.set([1], this.bufferSchema.isInitialValue.start);
	}
	/**
	 * 
	 * @returns {string}
	 */
	tokenTypeToString() {
		return Object.keys(this.TokenTypes)[this._buffer[this.bufferSchema['tokenType'].start]];
	}
	/**
	 * 
	 * @returns {number}
	 */
	tokenTypeToNumber() {
		return this._buffer[this.bufferSchema['tokenType'].start];
	}
	/**
	 * 
	 * @returns {string}
	 */
	getValueTypeAsString() {
		return Object.keys(this.ValueTypes)[this._buffer[this.bufferSchema['propertyType'].start]];
	}
	/**
	 * 
	 * @returns {number}
	 */
	getValueTypeAsNumber() {
		return this._buffer[this.bufferSchema['propertyType'].start];
	}
	/**
	 * 
	 * @returns {string}
	 */
	getUnitAsString() {
		return this.unitToString();
	}
	/**
	 * 
	 * @returns {string}
	 */
	getTokenTypeAsString() {
		return this.TokenTypesAsArray[this._buffer[this.bufferSchema['tokenType'].start]];
	}
	/**
	 * 
	 * @returns {number}
	 */
	getTokenTypeAsNumber() {
		return this._buffer[this.bufferSchema['tokenType'].start];
	}
	/**
	 * 
	 * @returns {string}
	 */
	unitToString() {
		return this.UnitsAsArray[this._buffer[this.bufferSchema['unit'].start]];
	}
	/**
	 * 
	 * @param {string} unit 
	 */
	setUnit(unit) {
		var idxOfUnit = this.UnitsAsArray.indexOf(unit);
		if (idxOfUnit === -1)
			return;
		this._buffer.set([idxOfUnit], this.bufferSchema.unit.start);
	}
	// getValueAsString() is an alias for bufferedValueToString()
	// TODO: unify
	/**
	 * 
	 * @returns {string}
	 */
	getValueAsString() {
		return this.bufferedValueToString();
	}
	//CSSPropertyBuffer.prototype.getValueAsHash = function() {
	//	return '#' + this.bufferedValueToString();
	//}
	// getValueAsNumber() is an alias for bufferedValueToNumber()
	// TODO: unify
	/**
	 * 
	 * @returns {number}
	 */
	getValueAsNumber() {
		return this.bufferedValueToNumber();
	}
	// bufferedValueToString() is an alias for getValueAsString()
	// TODO: unify
	/**
	 * 
	 * @returns {string}
	 */
	bufferedValueToString() {
		var start = this.bufferSchema.repr.start, end = start + this.bufferSchema.repr.length, strLengthIdx = this.bufferSchema.reprLength.start;
		//	console.log(start, end, this._buffer.slice(start, end));
		//	var test = this._buffer.slice(start, end).bufferToString(this._buffer[strLengthIdx]);
		//	if (test.slice(0, 1) === '#')
		//		console.log(test);
		return this._buffer.slice(start, end).bufferToString(this._buffer[strLengthIdx]);
	}
	// bufferedValueToNumber() is an alias for getValueAsNumber()
	// TODO: unify
	/**
	 * 
	 * @returns {number}
	 */
	bufferedValueToNumber() {
		var start = this.bufferSchema['propertyValue'].start, end = start + this.bufferSchema['propertyValue'].length;
		return this.byteTuppleTo16bits(this._buffer.slice(start, end));
	}
	/**
	 * 
	 * @param {ArrayBuffer} bytesInt8Array 
	 * @returns {number}
	 */
	byteTuppleTo16bits(bytesInt8Array) {
		return generatorFor16bitsInt.numberFromInt(bytesInt8Array);
	}
}










//var countTokenTypes = {
//	IDENT : 0,
//	NUMBER : 0,
//	PERCENTAGE : 0,
//	COLORorFUNCTION : 0,
//	un_defined : 0
//}
//console.log(countTokenTypes);


const LocalTokenFromParserFactory = function(parsedValue, tokenTypeFromParser) {
	
	if (tokenTypeFromParser && LocalTokenFromParserCache[tokenTypeFromParser])
		return LocalTokenFromParserCache[tokenTypeFromParser];
	else {
		tokenTypeFromParser = parsedValue ? Object.getPrototypeOf(parsedValue).tokenType : tokenTypeFromParser;
		
		const LocalTokenFromParser = function(tokenType, value, name, type, repr, unit) {
			var localValue = 0, localType = 'string', localRepr = '';
			if (tokenTypeFromParser === 'IDENT' || tokenTypeFromParser === 'NONPARSED') {
				localRepr  = repr || (value ? value.toString() : '');
				localType = 'string';
//				countTokenTypes['IDENT']++;
			}
			else if (tokenTypeFromParser === 'NUMBER' || tokenTypeFromParser === 'DIMENSION') {	// typeof value !== 'undefined' && Object.getPrototypeOf(value) === Number.prototype
				localRepr = (value || localValue).toString() + (unit || '');
				localValue = value || localValue;
				localType = 'number';
//				countTokenTypes['NUMBER']++;
			}
			else if (type === 'hash' || type === 'id' || type === 'unrestricted' || (tokenTypeFromParser === 'FUNCTION' && name === 'rgb')) {
				localRepr  = repr || '#' + (value || localValue).toString();
				localType = 'hash';
//				countTokenTypes['COLORorFUNCTION']++;
			}
			else if (tokenTypeFromParser === 'PERCENTAGE') {
				localValue = value || localValue;
				localRepr  = (repr ? (repr.slice(-1) === '%' ? repr : repr + '%') : (value ? value.toString() : '0')  + '%');
				localType = 'percentage';
//				countTokenTypes['PERCENTAGE']++;
			}
			else if (typeof type === 'undefined') {
				localRepr  = value ? value.toString() : '';
//				countTokenTypes['un_defined']++;
			}
			
			this.localTokenType = tokenType ? tokenType : tokenTypeFromParser.capitalizeFirstChar() + 'Token';
			this.value = localValue;
			this.type = localType;
			this.repr = localRepr;
			this.reprLength = this.repr.length;
			this.unit = unit || '';
		}
		LocalTokenFromParser.prototype = {
			tokenType : tokenTypeFromParser || 'NONE'
		}
		LocalTokenFromParserCache[LocalTokenFromParser] = LocalTokenFromParser;
		
		return LocalTokenFromParser
	}
}

var LocalTokenFromParserCache = {
	
}












Object.defineProperty(CSSPropertyBuffer.prototype, 'TokenTypes', {
	value : {
			UndefinedToken : 0, 
			BadstringToken : 1,
			BadurlToken : 2,
			WhitespaceToken : 3,
			CdoToken : 4,
			CdcToken : 5,
			ColonToken : 6,
			SemicolonToken : 7,
			CommaToken : 8,
			OpencurlyToken : 9,
			ClosecurlyToken : 10,
			OpensquareToken : 11,
			ClosesquareToken : 12,
			OpenparenToken : 13,
			CloseparenToken : 14,
			IncludeMatchToken : 15,
			DashmatchToken : 16,
			PrefixmatchToken : 17,
			SuffixmatchToken : 18,
			SubstringmatchToken : 19,
			ColumnToken : 20,
			EOFToken : 21,
			DelimToken : 22,
			IdentToken : 23,
			FunctionToken : 24,
			AtkeywordToken : 25,
			HashToken : 26,
			StringToken : 27,
			UrlToken : 28,
			NumberToken : 29,
			PercentageToken : 30,
			DimensionToken : 31,
			NonparsedToken : 32
			}
});

Object.defineProperty(CSSPropertyBuffer.prototype, 'stdStrLength', {
	value : 89
});

Object.defineProperty(CSSPropertyBuffer.prototype, 'ValueTypes', {
	value : {
		integer : 0,
		percentage : 1,
		float : 2,
		string : 3,
		hash : 4,
		numericalArray : 5,
		'' : 6
	}
});

Object.defineProperty(CSSPropertyBuffer.prototype, 'Units', {
	value : {
		'' : {
			idx : 0,
			unit : '',
			fullName : 'non-applicable',
			equivStr : 'some values have no unit'
		},
		cm : {
			idx : 1,
			unit : 'cm',
			fullName : 'centimeters',
			equivStr : '1cm : 96px/2.54'
		} ,
		mm : {
			idx : 2,
			unit : 'mm',
			fullName : 'millimeters',
			equivStr : '1mm : 1/10th of 1cm'
		} ,
		Q : {
			idx : 3,
			unit : 'Q',
			fullName : 'quarter',
			equivStr : '1Q : 1/40th of 1cm'
		},
		in : {
			idx : 4,
			unit : 'in',
			fullName : 'inches',
			equivStr : '1in : 2.54cm : 96px'
		},
		pc : {
			idx : 5,
			unit : 'pc',
			fullName : 'picas',
			equivStr : '1pc : 1/6th of 1in'
		},
		pt : {
			idx : 6,
			unit : 'pt',
			fullName : 'points',
			equivStr : '1pt : 1/72th of 1in'
		},
		px : {
			idx : 7,
			unit : 'px',
			fullName : 'pixels',
			equivStr : '1px : 1/96th of 1in '
		},
		em : {
			idx : 8,
			unit : 'em',
			fullName : 'size of the uppercase M',
			equivStr : '1em is equivalent to the inherited font-size'
		},
		rem : {
			idx : 9,
			unit : 'rem',
			fullName : 'root em',
			equivStr : '1rem is equivalent to the root element\'s font-size'
		},
		fr : {
			idx : 10,
			unit : 'fr',
			fullName : 'flex grid unit',
			equivStr : 'flexibility factor of a grid track'
		},
		s : {
			idx : 11,
			unit : 's',
			fullName : 'seconds',
			equivStr : 'seconds are used when defining the duration of an animation'
		}
	}
});

Object.defineProperty(CSSPropertyBuffer.prototype, 'UnitsAsArray', {
	value : (function() {
		var ret = [];
		for (var unitDef in CSSPropertyBuffer.prototype.Units)  {
			ret.push(CSSPropertyBuffer.prototype.Units[unitDef].unit)
		}
		return ret;
	})()
});

Object.defineProperty(CSSPropertyBuffer.prototype, 'TokenTypesAsArray', {
	value : (function() {
		return Object.keys(CSSPropertyBuffer.prototype.TokenTypes);
	})()
});


//var sample = {
//	token: "DIMENSION",
//	value: 1,
//	type: "integer",
//	repr: "1",
//	unit: "px"
//}








export default CSSPropertyBuffer;