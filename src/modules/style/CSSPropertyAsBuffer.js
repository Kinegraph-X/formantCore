/**
 * CSSPropertyBuffer is a binary-backed container 
 * for storing and manipulating individual CSS property values
 * 
 * It is used in CSSStyleRuleSliceAsBuffer to store the value of a CSS property.
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
 * Used primarily within CSSStyleRuleSliceAsBuffer to manage collections of CSS properties 
 * It is instantiated both during initialization and runtime style updates
 * 
 */


import {capitalizeFirstLetter, getNcharsAsCharCodesArray} from '../nativeTypesUtilities/StringUtilities.js';
import {bufferToString} from '../nativeTypesUtilities/Uint8ArrayUtilities.js'
import {BinarySchemaFactory} from '../buffer/BinarySchema.js';
import {allCSSPropertyDescriptors} from './CSSPropertyDescriptors';
import {parseAListOfComponentValues} from '../../third-party/css-parser_forked_normalized.js';
// import type ParserToken from './ParserTokenType'
import {generatorFor16bitsInt} from '../UIDGenerator.js'

/** @typedef {import("./ParserTokenType.ts").ParserToken} ParserToken */
/** @typedef {import("./CSSPropertyDescriptors").AllCSSPropertyName} AllCSSPropertyName*/

// import {allCSSPropertyDescriptors} from './CSSPropertyDescriptors.js';


/**
 * Correspondance between parser types and buffer types
 * 
| Parser `tokenType` (string)   | Parser class                          | Buffer `TokenTypes` key                                             | Notes / Value normalization                                                                                              |
| ----------------------------- | ------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `IDENT`                       | `IdentToken`                          | `IdentToken`                                                        | Parser: `.repr` is identifier. Buffer: expects type=`string`.                                                            |
| `FUNCTION`                    | `FunctionToken`                       | `FunctionToken`                                                     | Special-cased: `rgb()`/`rgba()` collapsed into `HASH`; `url()` becomes `UrlToken`; unsupported funcs → `UndefinedToken`. |
| `ATKEYWORD`                   | `AtKeywordToken`                      | `AtkeywordToken`                                                    | Note casing mismatch (`ATKEYWORD` vs `AtkeywordToken`).                                                                  |
| `HASH`                        | `HashToken`                           | `HashToken`                                                         | Parser `.type` = `"id"` or `"unrestricted"`. Buffer coerces into type=`hash`.                                            |
| `STRING`                      | `StringToken`                         | `StringToken`                                                       | Parser: `.repr` is quoted string. Buffer: type=`string`.                                                                 |
| `URL`                         | `URLToken`                            | `UrlToken`                                                          | Naming mismatch (`URL` vs `UrlToken`). Buffer stores `.repr` directly.                                                   |
| `NUMBER`                      | `NumberToken`                         | `NumberToken`                                                       | Parser `.type` = `"integer"` or `"number"`. Buffer maps to ValueTypes: `integer` or `float`. Parser `.repr` kept.        |
| `PERCENTAGE`                  | `PercentageToken`                     | `PercentageToken`                                                   | Parser: `.value`, `.repr` (no `%` suffix). Buffer ensures `repr` ends with `%` and type=`percentage`.                    |
| `DIMENSION`                   | `DimensionToken`                      | `DimensionToken`                                                    | Parser: `{ value, type, repr, unit }`. Buffer: coerced to ValueTypes `integer`/`float` + unit index from `Units`.        |
| `DELIM`                       | `DelimToken`                          | `DelimToken`                                                        | Parser `.value` is the single char. Buffer stores `.repr`.                                                               |
| `WHITESPACE`                  | `WhitespaceToken`                     | `WhitespaceToken`                                                   | Collapses to space in concat.                                                                                            |
| `COMMA`                       | `CommaToken`                          | `CommaToken`                                                        | Collapses to `,`.                                                                                                        |
| `COLON`                       | `ColonToken`                          | `ColonToken`                                                        | Punctuation only.                                                                                                        |
| `SEMICOLON`                   | `SemicolonToken`                      | `SemicolonToken`                                                    | Punctuation only.                                                                                                        |
| `CDO`, `CDC`                  | `CDOToken`, `CDCToken`                | `CdoToken`, `CdcToken`                                              | Rarely used.                                                                                                             |
| `OPENPAREN`/`CLOSEPAREN`      | `OpenParenToken`, `CloseParenToken`   | `OpenparenToken`, `CloseparenToken`                                 | Used in concatenation.                                                                                                   |
| `OPENCURLY`/`CLOSECURLY`      | `OpenCurlyToken`, `CloseCurlyToken`   | `OpencurlyToken`, `ClosecurlyToken`                                 | Used in blocks.                                                                                                          |
| `OPENSQUARE`/`CLOSESQUARE`    | `OpenSquareToken`, `CloseSquareToken` | `OpensquareToken`, `ClosesquareToken`                               | Used in blocks.                                                                                                          |
| `EOF`                         | `EOFToken`                            | `EOFToken`                                                          | End of stream.                                                                                                           |
| `BADSTRING`                   | `BadStringToken`                      | `BadstringToken`                                                    | Error tokens.                                                                                                            |
| `BADURL`                      | `BadURLToken`                         | `BadurlToken`                                                       | Error tokens.                                                                                                            |
| `*MATCH` (e.g. `PREFIXMATCH`) | `PrefixMatchToken`, etc.              | `PrefixmatchToken`, `SuffixmatchToken`, `SubstringmatchToken`, etc. | Direct mapping, just casing differences.                                                                                 |
| `COLUMN`                      | `ColumnToken`                         | `ColumnToken`                                                       | Direct mapping.                                                                                                          |
 */




/**
 * Compact binary representation of a single CSS property value.
 *
 * What this is
 * - A fixed-size typed-array buffer specialized to store ONE CSS property’s value.
 * - Optimized to avoid allocations while shuttling values between parsing, shorthand expansion,
 *   resolution, and string/number serialization.
 *
 * Where it’s used
 * - Instantiated but not-owned by `CSSStyleRuleSliceAsBuffer` to represent each property slot within a rule slice.
 * - Built on initialization in `CSSStyleRuleSliceAsBuffer.fromCategory()` using descriptor initial values.
 * - Created transiently at many call sites to set/override a property via
 *   `CSSStyleRuleSliceAsBuffer.setPropFromBuffer()`.
 *
 * Data model (bufferSchema)
 * - tokenType: one of `TokenTypes` (e.g. NumberToken, DimensionToken, PercentageToken, IdentToken, StringToken, HashToken, FunctionToken)
 * - propertyValue: 16-bit numeric payload (only meaningful for NUMBER/DIMENSION/PERCENTAGE)
 * - type: one of `ValueTypes` (e.g. 'integer', 'number', 'percentage', 'hash', 'string', etc.)
 * - repr: compact string representation (up to `stdStrLength` chars, e.g. '10px', 'center', '#fff', 'url(x.png)')
 * - reprLength: byte-length of `repr`
 * - unit: unit index (e.g. 'px', '%', 'em', '', see `Units`)
 * - isInitialValue: 1 if buffer stores the descriptor initial value, 0 otherwise
 *
 * Choosing APIs
 * - setValue(value: string): Raw-first setter for strings. It:
 *   1) Splits comma-lists and keeps the first item.
 *   2) If the property is a shorthand (per descriptors), it DOES NOT parse; it creates a mock STRING token and calls [setFromParsedToken()](cci:1://file:///./CSSPropertyAsBuffer.js:161:1-173:2).
 *   3) If not a shorthand, it parses the first item (to preserve functions like url(), rgb(), var(), calc()) and calls [setFromParsedToken()](cci:1://file:///./CSSPropertyAsBuffer.js:161:1-173:2) with the first real token.
 *   Use this when you have a CSS string and want fast, correct behavior without duplicating shorthand logic.
 *
 * - setFromParsedToken(parsedToken): Token-first setter. Expects a token from the embedded parser (or a mocked one) and normalizes it into the buffer.
 *   Use this inside shorthand handlers where tokens are already available to avoid reparsing strings.
 *
 * - normalizeTokenForBuffer(parsedToken): Fast-Canonicalizes parser tokens into the buffer’s schema.
 * - fullNormalizeTokenForBuffer(parsedToken): Full-Canonicalizes parser tokens into the buffer’s schema.
 *   - Infers `type` ('integer'|'number'|'percentage'|'hash'|'string').
 *   - Normalizes `repr` for special tokens (e.g., '0'+'%' -> '0%'; 'fff' -> '#fff').
 *   - Sets numeric `value` only for NUMBER/DIMENSION/PERCENTAGE; defaults to 0 otherwise.
 *
 * Common flows
 * - Initialization:
 *   `CSSStyleRuleSliceAsBuffer.fromCategory()` creates a [CSSPropertyAsBuffer](cci:2://file:///./CSSPropertyAsBuffer.js:92:0-480:1) 
 * 		for each property and calls [setValue(initialValue)](cci:1://file:///./CSSPropertyAsBuffer.js:125:1-158:2) once.
 *
 * - Setting a property:
 *   - Call sites construct a [CSSPropertyAsBuffer(null, propName)](cci:2://file:///./CSSPropertyAsBuffer.js:92:0-480:1), 
 * 		then call [setValue(...)](cci:1://file:///./CSSPropertyAsBuffer.js:125:1-158:2), set `isInitialValue = 0`,
 *     and pass it to `CSSStyleRuleSliceAsBuffer.setPropFromBuffer(propName, propBuffer)`.
 *   - Shorthands are detected at the slice level and expanded into longhands as needed, often reusing tokens to avoid reparsing.
 *
 * Performance notes
 * - String parsing is avoided for shorthands on purpose; expansion happens in `CSSStyleRuleSliceAsBuffer`.
 * - For non-shorthands, minimal parsing is performed to allow function canonicalization.
 * - `repr` is capped by `stdStrLength` to keep buffers compact and predictable.
 *
 * See also
 *  @see [CSSStyleRuleSliceAsBuffer.js](cci:7://file:///./CSSStyleRuleSliceAsBuffer.js:0:0-0:0):
 *  @see CSSStyleRuleSliceAsBuffer.fromCategory() – initializes property slots.
 *  @see CSSStyleRuleSliceAsBuffer.setPropFromBuffer() – integrates a property buffer and expands shorthands.
 *  @see CSSStyleRuleSliceAsBuffer.setValuesFromShorthand() and helpers – token-first shorthand handling.
 *  @see CSSPropertyDescriptors.js  metadata for properties (initial values, shorthand expansions).
 *
 * @example
 * // Mirror longhand string for background-size (preserves multi-token string, avoids reparsing if shorthand)
 * tmp.setProp('backgroundSize');
 * tmp.setValue('10px auto');
 * slice.setPropFromBuffer('backgroundSize', tmp);
 *
 * @example
 * // Token-first path inside shorthand handler:
 * tmp.setProp('backgroundPositionX');
 * tmp.setFromParsedToken({tokenType:'PERCENTAGE', repr:'50%', value:50});
 * slice.setPropFromBuffer('backgroundPositionX', tmp);
 */
class CSSPropertyAsBuffer {
	static objectType = 'CSSPropertyBuffer';
	static bufferSchema = BinarySchemaFactory.createSchema(
		'compactedViewOnProperty',
		[
			'tokenType',
			'propertyValue',
			'type',
			'repr',
			'reprLength',
			'unit',
			'isInitialValue'
		],
		[
			1,
			2,
			1,
			CSSPropertyAsBuffer.prototype.stdStrLength,		// defining a tight limit to the size of the representation of a string is obviously a strong opinion)
			1,
			1,
			1
		]
	);
	static propsAcceptListOfValues = ['background', 'fontFamily', 'animation', 'transition', 'textShadow', 'cursor', 'boxShadow'];
	/**
	 * @param {Uint8Array|null} [initialLoad] 
	 * @param {AllCSSPropertyName} [propName]
	 */
	constructor(initialLoad = null, propName) {
		this.objectType = 'CSSPropertyBuffer';
		this.propName = propName;
		/** @ts-ignore TS being a subset of JS, the ctor doesn't accept number type */
		this._buffer = new Uint8Array(initialLoad ?? (CSSPropertyAsBuffer.bufferSchema.size));
	}

	/**
	 * @param {AllCSSPropertyName} propName 
	 */
	setProp(propName) {
		this.propName = propName;
	}
	/**
	 * 
	 * @param {string} propName 
	 * @returns {boolean}
	 */
	propAcceptList(propName) {
		return CSSPropertyAsBuffer.propsAcceptListOfValues
			.filter((sample) => propName.includes(sample))
			.length !== 0;
	}

	/**
	 * @param {ParserToken} token 
	 */
	tokenIsValidFunction(token) {
		const tokenType = `${capitalizeFirstLetter(token.tokenType)}Token`;
		return tokenType === 'FunctionToken' && Array.isArray(token.value)
	}

	/**
	 * @param {ParserToken} token
	 */
	tokenIsHash(token) {
		return token.tokenType === 'HASH' || token.tokenType === this.typeMap['HASH'];
	}

	/**
	 * 
	 * @param {ParserToken[]} tokens 
	 */
	reconstructTokenFromComponents(tokens) {
		return tokens.reduce(
			(acc, val, key) => {acc.repr += val.repr; return acc;},
			{ tokenType: 'STRING', value : 0, type: tokens[0].type, repr: '', unit: ''}
		)
	}

	/**
	 * Raw-first string setter:
	 * Sets a raw CSS property value, avoiding full parsing as performance is critical.
	 * Handles both shorthand and longhand CSS properties by either mocking a parsed token or parsing the value,
	 * depending on the property type, to avoid redundant work.
	 * Downstream normalization and shorthand handlers will take over.
	 * 
	 * @see CSSStyleRuleSliceAsBuffer.fromCategory() for initialization with descriptor initial values.
	 * Called by shorthand handlers to avoid reparsing strings:
	 * @see CSSStyleRuleSliceAsBuffer.setValueFromBackgroundShorthand() where single-longhand mirrors call setValue().
	 * 
	 * @example:
	 *   tmp.setProp('backgroundSize'); tmp.setValue('10px auto'); // preserves multi-token strings and reparses string only if not shorthand
	 * @param {string} value
	 */
	setValue(value) {
		if (!this.propName)
			throw new Error('Wrong usage of a CSSPropertyAsBuffer: propName is falsy');
		
		// For now, value lists aren't supported
		if (this.propAcceptList(this.propName))
			value = value.split(',')[0].trim();
		else
			value = value.trim();

		// An empty string is generally handled silently by the browser
		if (!value.length) {
			console.error('A CSS property has been found with empty value. propName is', this.propName);
			return
		}

		const desc = allCSSPropertyDescriptors[this.propName] || null;
		
		// If shorthand (or fake shorthand), do not parse here to avoid double work.
		if (desc && desc.isShorthand) {
			const mock = { tokenType: 'STRING', value : 0, type: 'string', repr: value, unit: ''};
			this.setFromParsedToken(mock);
			return;
		}
		
		// Not a shorthand: parse to resolve functions when at start of value (url(), rgb(), var(), calc(), ...).
		const tokens = parseAListOfComponentValues(value);
		const tok = this.reconstructTokenFromComponents(tokens);
		this.setFromParsedToken(tok);
	}


	/**
	 * Token-first setter:
	 * for callers that already have parser tokens (e.g., shorthand handlers).
	 * Normalizes via [normalizeTokenForBuffer()](cci:1://file:///./CSSPropertyAsBuffer.js:284:1-316:2) 
 	 * then writes into the buffer with [populate()](cci:1://file:///./CSSPropertyAsBuffer.js:214:1-267:2).
	 * 
	 * @param {ParserToken} parsedToken 
	 */
	setFromParsedToken(parsedToken) {
		// if the property is a shorthand property, or if the property may be abbreviated,
		// we resolve canonical values, or set the original value (for now, url's aren't really handled)
		// Shorthands are handled in CSSStyleRuleSliceAsBuffer
		
		let normalized = parsedToken;
		if (this.tokenIsValidFunction(parsedToken)) {
			try {
				normalized = this.functionToCanonical(parsedToken, parsedToken.repr || '');
			}
			catch (e) {
				 /** @ts-ignore array type tested above */
				parsedToken.value = Number((parsedToken.value[0]));
				this.populate(parsedToken.tokenType, parsedToken);
				return;
			}
		}
		else if (this.tokenIsHash(parsedToken)) {
			normalized = this.hashToCanonical(parsedToken);
		}

		normalized = this.normalizeTokenForBuffer(normalized);
		this.populate(normalized.tokenType, normalized);
	}

	/**
	 * valueAsParsed is token from parser
	 * @param {ParserToken} valueAsParsed 
	 * @param {string} trimedOriginalValue 
	 */
	functionToCanonical(valueAsParsed, trimedOriginalValue) {
		var tokenTypeFromParser;
		if (valueAsParsed.name === 'rgb' || valueAsParsed.name === 'rgba') {
			// We'll store the value as a hash string and a 24/32bit int
			/** @type {string[]} */
			const tmpArray = [];
			let tmpValue = 0, c = 0;

			/** @type {ParserToken[]} */
			(valueAsParsed.value).forEach((val) => {
				if (c > 3) {
					throw new Error('rgb/a function declaration error:' + this.propName);
				}
				tokenTypeFromParser = val.tokenType;
				if (tokenTypeFromParser === "WHITESPACE" || tokenTypeFromParser === "COMMA")
					return;
				else {
					tmpValue = /**@type {number}*/ (val.value) & 0xff << c * 8 | tmpValue;
					tmpArray.push(val.value.toString(16).padStart(2, '0'));
					c++;
				}
			});
			valueAsParsed.value = tmpValue;
			valueAsParsed.repr = `#${tmpArray.join('')}`;
			valueAsParsed.tokenType = 'HASH';
			return valueAsParsed;
		}
		else {
			// As for now, "format" and "local" are seen as unsupported functions
			if ((valueAsParsed.name === 'format' || valueAsParsed.name === 'local')
				|| (valueAsParsed.name === 'animation' || valueAsParsed.name === 'animationName' || valueAsParsed.name === 'animationDuration' || valueAsParsed.name === 'animationIterationCount' || valueAsParsed.name === 'animationIterationFunction' || valueAsParsed.name === 'animationDelay'))
				return valueAsParsed;
			else if (valueAsParsed.name === 'url') {
				valueAsParsed.repr = trimedOriginalValue;
				return valueAsParsed;
			}

			console.warn('CSSPropertyBuffer->functionToCanonical: unsupported function given (' + valueAsParsed.name + ').');
			return valueAsParsed;
		}
	}

	/**
	 * @param {ParserToken} token
	 */
	hashToCanonical(token) {
		let tmpValue = 0, c = 0;
		const repr = token.repr.indexOf('#') !== -1 ? token.repr.slice(1) : token.repr;
		token.value = parseInt(repr, 16);
		return token;
	}

	/**
	 * @param {string} tokenType 
	 * @param {ParserToken} value 
	 */
	populate(tokenType, value) {
		// the buffer size : 64 bytes buffers shall align on a L2 CPU cache
		// 16 bits values have to be declared as byte-tuples 
		// ([1, 0] would then represent 1, as all CPU's are now little-endian) 
		// (generatorFor16bitsInt, responsible for the UID, shall return an array)

		var normalizedValue = value; 
		if (typeof normalizedValue.repr === 'undefined')
			console.error('normalizedValue', normalizedValue);
		var strVal = normalizedValue.repr,
			strLength = strVal.length,
			strBuf = getNcharsAsCharCodesArray(strVal, this.stdStrLength, 0)[1],
			valueBuf = generatorFor16bitsInt.intFromNumber(/**@type{number}*/(normalizedValue.value));

		// this.TokenTypes[tokenType] is the TokenType from the parser (remapped to our types)
		// represented as a numeric constant
		this._buffer.set(
			[this.TokenTypes[tokenType]],
			CSSPropertyAsBuffer.bufferSchema.tokenType.start
		);
		// value type
		var valueTypeAsConst = this.ValueTypes[value.type];
		this._buffer.set(
			[valueTypeAsConst],
			CSSPropertyAsBuffer.bufferSchema.type.start
		);
		// value
		// FIXME: floats are NOT handled by our CSSPropertyBuffer type,
		// and flexGrow, font[em], and even dimensions may be float
		// For now, it acts like if we had parseInt the number
		this._buffer.set(
			valueBuf,
			CSSPropertyAsBuffer.bufferSchema.propertyValue.start
		);
		// representation
		this._buffer.set(
			strBuf,
			CSSPropertyAsBuffer.bufferSchema.repr.start
		);
		// representation string length
		this._buffer.set(
			[strLength],
			CSSPropertyAsBuffer.bufferSchema.reprLength.start
		);
		// unit
		this._buffer.set(
			[value.unit ? this.Units[value.unit].idx : 0],
			CSSPropertyAsBuffer.bufferSchema.unit.start
		);
	}
	// /**
	//  * The two following functions are broken
	//  * @see setValue()
	//  * @param {string} singleValueAsString 
	//  */
	// parseAndSetValue(singleValueAsString) {
	// 	var parsedValue;
	// 	if ((parsedValue = this.parseValue(singleValueAsString)).length)
	// 		this.setFromParsedToken(parsedValue);
	// }
	// /**
	//  * 
	//  * @param {string} singleValueAsString 
	//  */
	// parseValue(singleValueAsString) {
	// 	return /** @type {ParserToken[]} */ (parseAListOfComponentValues(singleValueAsString));
	// }

	/**
	 * Shim: normalize parser tokens into CSSPropertyBuffer-compatible objects.
	 * We try to do the least checks possible, for perf concerns.
	 * So there's a strong contract with the parser (but the contract already exists
	 * on the shape of the tokens, and we can't avoid it)
	 * @param {ParserToken} parsedToken - Token from css-parser_forked_normalized
	 * @returns {ParserToken} normalized token (with .tokenType, .repr, .value, .type, .unit)
	 */
	normalizeTokenForBuffer(parsedToken) {
		if (!parsedToken) {
			throw new Error('CSSPropertyAsBuffer normalizeTokenForBuffer: parsedToken is undefined');
		}
		if (typeof parsedToken.repr !== 'string') {
			throw new Error(`CSSPropertyAsBuffer normalizeTokenForBuffer: parsedToken.repr is not a string ${parsedToken}`);
		}
		if(typeof parsedToken.value !== 'number') {
			throw new Error(`CSSPropertyAsBuffer normalizeTokenForBuffer: parsedToken.value is not a number ${parsedToken}`);
		}
		if (parsedToken.tokenType === 'HASH' && !parsedToken.repr.startsWith('#')) {
			throw new Error(`CSSPropertyAsBuffer normalizeTokenForBuffer: parsedToken.repr does not start with # ${parsedToken}`);
		}

		// Derived from parser token // e.g. "IDENT", "URL", "NUMBER"
		const tokenType = this.typeMap[parsedToken.tokenType] || "UndefinedToken";

		return { 
			tokenType,
			repr: parsedToken.repr,
			value: parsedToken.value,
			type: parsedToken.type,
			unit: parsedToken.unit
		};
	}
	// /**
	//  * parsed value is token from parser
	//  * @param {ParserToken[]} parsedValue 
	//  */
	// concatenateBackFromParser(parsedValue) {
	// 	var tokenTypeFromParser;
	// 	var concatVal = '';
	// 	parsedValue.forEach(function (val) {
	// 		tokenTypeFromParser = Object.getPrototypeOf(val).tokenType;
	// 		switch (tokenTypeFromParser) {
	// 			case 'WHITESPACE':
	// 				concatVal += ' ';
	// 				break;
	// 			case 'PERCENTAGE':
	// 				concatVal += val.repr + '%';
	// 				break;
	// 			case 'HASH':
	// 				concatVal += val.value ? '#' + val.value : val.repr;
	// 				break;
	// 			case 'COMMA':
	// 				concatVal += ',';
	// 				break;
	// 			case 'FUNCTION':
	// 				concatVal += this.functionToCanonical(val).repr;
	// 			case 'OPENPAREN':
	// 				concatVal += '(';
	// 				break;
	// 			case 'CLOSEPAREN':
	// 				concatVal += ')';
	// 				break;
	// 			default: concatVal += typeof val.repr !== 'undefined' ? val.repr + this.Units[val.unit || ''].unit : val.value.toString() + this.Units[val.Units || ''].unit;
	// 		}
	// 	}, this);
	// 	return concatVal;
	// }
	/**
	 * 
	 * @returns {boolean}
	 */
	getIsInitialValue() {
		return !!this._buffer[CSSPropertyAsBuffer.bufferSchema.isInitialValue.start];
	}
	/**
	 * 
	 * @returns {boolean}
	 */
	getIsInitialValueAsBool() {
		return !!this._buffer[CSSPropertyAsBuffer.bufferSchema.isInitialValue.start];
	}
	/**
	 * 
	 */
	setIsInitialValue() {
		this._buffer.set([1], CSSPropertyAsBuffer.bufferSchema.isInitialValue.start);
	}
	/**
	 * 
	 * @returns {string}
	 */
	tokenTypeToString() {
		return this.TokenTypesAsArray[this._buffer[CSSPropertyAsBuffer.bufferSchema['tokenType'].start]];
	}
	/**
	 * 
	 * @returns {number}
	 */
	tokenTypeToNumber() {
		return this._buffer[CSSPropertyAsBuffer.bufferSchema['tokenType'].start];
	}
	/**
	 * 
	 * @returns {string}
	 */
	getValueTypeAsString() {
		return this.ValueTypesAsArray[this._buffer[CSSPropertyAsBuffer.bufferSchema['type'].start]];
	}
	/**
	 * 
	 * @returns {number}
	 */
	getValueTypeAsNumber() {
		return this._buffer[CSSPropertyAsBuffer.bufferSchema['type'].start];
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
		return this.TokenTypesAsArray[this._buffer[CSSPropertyAsBuffer.bufferSchema['tokenType'].start]];
	}
	/**
	 * 
	 * @returns {number}
	 */
	getTokenTypeAsNumber() {
		return this._buffer[CSSPropertyAsBuffer.bufferSchema['tokenType'].start];
	}
	/**
	 * 
	 * @returns {string}
	 */
	unitToString() {
		return this.UnitsAsArray[this._buffer[CSSPropertyAsBuffer.bufferSchema['unit'].start]];
	}
	/**
	 * 
	 * @param {string} unit 
	 */
	setUnit(unit) {
		var idxOfUnit = this.UnitsAsArray.indexOf(unit);
		if (idxOfUnit === -1)
			return;
		this._buffer.set([idxOfUnit], CSSPropertyAsBuffer.bufferSchema.unit.start);
	}
	/**
	 * getValueAsString() is an alias for bufferedValueToString()
	 * TODO: unify
	 * @returns {string}
	 */
	getValueAsString() {
		return this.bufferedValueToString();
	}
	/**
	 * getValueAsNumber() is an alias for bufferedValueToNumber()
	 * TODO: unify
	 * @returns {number}
	 */
	getValueAsNumber() {
		return this.bufferedValueToNumber();
	}
	/**
	 * bufferedValueToString() is an alias for getValueAsString()
	 * TODO: unify
	 * @returns {string}
	 */
	bufferedValueToString() {
		var start = CSSPropertyAsBuffer.bufferSchema.repr.start, end = start + CSSPropertyAsBuffer.bufferSchema.repr.length, strLengthIdx = CSSPropertyAsBuffer.bufferSchema.reprLength.start;
		return bufferToString(this._buffer.slice(start, end), this._buffer[strLengthIdx]);
	}
	/**
	 * bufferedValueToNumber() is an alias for getValueAsNumber()
	 * TODO: unify
	 * @returns {number}
	 */
	bufferedValueToNumber() {
		var start = CSSPropertyAsBuffer.bufferSchema['propertyValue'].start, end = start + CSSPropertyAsBuffer.bufferSchema['propertyValue'].length;
		return this.byteTuppleTo16bits(this._buffer.slice(start, end));
	}
	/**
	 * 
	 * @param {Uint8Array} bytesInt8Array 
	 * @returns {number}
	 */
	byteTuppleTo16bits(bytesInt8Array) {
		if (bytesInt8Array.byteLength !== 2)
			throw new Error('byteTuppleTo16bits: given value isn\'t a 2 values tupple. Length is' + bytesInt8Array.byteLength);
		/** @ts-ignore tested above */
		return generatorFor16bitsInt.numberFromInt((bytesInt8Array));
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












Object.defineProperty(CSSPropertyAsBuffer.prototype, 'TokenTypes', {
	/** @type {Object<string, number>} */
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

// --- tokenType mapping between parser and buffer ---
Object.defineProperty(CSSPropertyAsBuffer.prototype, 'typeMap', {
	/** @type {Object<string, string>} */
	value : {
		IDENT: "IdentToken",
		FUNCTION: "FunctionToken",
		ATKEYWORD: "AtkeywordToken",
		HASH: "HashToken",
		STRING: "StringToken",
		URL: "UrlToken",
		NUMBER: "NumberToken",
		PERCENTAGE: "PercentageToken",
		DIMENSION: "DimensionToken",
		DELIM: "DelimToken",
		WHITESPACE: "WhitespaceToken",
		COMMA: "CommaToken",
		COLON: "ColonToken",
		SEMICOLON: "SemicolonToken",
		CDO: "CdoToken",
		CDC: "CdcToken",
		OPENPAREN: "OpenparenToken",
		CLOSEPAREN: "CloseparenToken",
		OPENCURLY: "OpencurlyToken",
		CLOSECURLY: "ClosecurlyToken",
		OPENSQUARE: "OpensquareToken",
		CLOSESQUARE: "ClosesquareToken",
		EOF: "EOFToken",
		BADSTRING: "BadstringToken",
		BADURL: "BadurlToken",
		INCLUDEMATCH: "IncludeMatchToken",
		DASHMATCH: "DashmatchToken",
		PREFIXMATCH: "PrefixmatchToken",
		SUFFIXMATCH: "SuffixmatchToken",
		SUBSTRINGMATCH: "SubstringmatchToken",
		COLUMN: "ColumnToken",
  }
});

Object.defineProperty(CSSPropertyAsBuffer.prototype, 'stdStrLength', {
	value : 89
});

/** @type {Object<string, number>} */
const valueTypes = {
	integer : 0,
	percentage : 1,
	number : 2,
	string : 3,
	hash : 4,
	numericalArray : 5,
	'' : 6
};

Object.defineProperty(CSSPropertyAsBuffer.prototype, 'ValueTypes', {
	value : valueTypes
});

Object.defineProperty(CSSPropertyAsBuffer.prototype, 'ValueTypesAsArray', {
	value : Object.keys(valueTypes)
});


Object.defineProperty(CSSPropertyAsBuffer.prototype, 'Units', {
	/**
	 * @type {{
	 * 	[key: string]: {
	 * 		idx: number,
	* 		unit : string,
	* 		fullName: string,
	* 		equivStr : string
	 * 	}
	 * }}
	 */
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

Object.defineProperty(CSSPropertyAsBuffer.prototype, 'UnitsAsArray', {
	value : (function() {
		var ret = [];
		for (var unitDef in CSSPropertyAsBuffer.prototype.Units)  {
			ret.push(CSSPropertyAsBuffer.prototype.Units[unitDef].unit)
		}
		return ret;
	})()
});

Object.defineProperty(CSSPropertyAsBuffer.prototype, 'TokenTypesAsArray', {
	value : (function() {
		return Object.keys(CSSPropertyAsBuffer.prototype.TokenTypes);
	})()
});


//var sample = {
//	token: "DIMENSION",
//	value: 1,
//	type: "integer",
//	repr: "1",
//	unit: "px"
//}








export default CSSPropertyAsBuffer;