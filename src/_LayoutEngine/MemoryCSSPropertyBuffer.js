/**
 * @constructor MemoryCSSPropertyBuffer
 */


var TypeManager = require('src/core/TypeManager');
var BinarySchemaFactory = require('src/core/BinarySchema');


var MemoryCSSPropertyBuffer = function(initialLoad) {
	this.objectType = 'MemoryCSSPropertyBuffer';

	//	this._occupancy = new Uint8Array(bufferSize);

	this._buffer = new Uint8Array(propsCount);


}
MemoryCSSPropertyBuffer.prototype = Object.create(Uint8Array.prototype);
MemoryCSSPropertyBuffer.prototype.objectType = 'MemoryCSSPropertyBuffer';

//var sample = {
//	token: "DIMENSION",
//	value: 1,
//	type: "integer",
//	repr: "1",
//	unit: "px"
//}

//\w+\.prototype\.tokenType\s?=\s?"[^"]+";

//BadStringToken.prototype.tokenType = "BADSTRING";
//BadURLToken.prototype.tokenType = "BADURL";
//WhitespaceToken.prototype.tokenType = "WHITESPACE";
//CDOToken.prototype.tokenType = "CDO";
//CDCToken.prototype.tokenType = "CDC";
//ColonToken.prototype.tokenType = ":";
//SemicolonToken.prototype.tokenType = ";";
//CommaToken.prototype.tokenType = ",";
//OpenCurlyToken.prototype.tokenType = "{";
//CloseCurlyToken.prototype.tokenType = "}";
//OpenSquareToken.prototype.tokenType = "[";
//CloseSquareToken.prototype.tokenType = "]";
//OpenParenToken.prototype.tokenType = "(";
//CloseParenToken.prototype.tokenType = ")";
//IncludeMatchToken.prototype.tokenType = "~=";
//DashMatchToken.prototype.tokenType = "|=";
//PrefixMatchToken.prototype.tokenType = "^=";
//SuffixMatchToken.prototype.tokenType = "$=";
//SubstringMatchToken.prototype.tokenType = "*=";
//ColumnToken.prototype.tokenType = "||";
//EOFToken.prototype.tokenType = "EOF";
//DelimToken.prototype.tokenType = "DELIM";
//IdentToken.prototype.tokenType = "IDENT";
//FunctionToken.prototype.tokenType = "FUNCTION";
//AtKeywordToken.prototype.tokenType = "AT-KEYWORD";
//HashToken.prototype.tokenType = "HASH";
//StringToken.prototype.tokenType = "STRING";
//URLToken.prototype.tokenType = "URL";
//NumberToken.prototype.tokenType = "NUMBER";
//PercentageToken.prototype.tokenType = "PERCENTAGE";
//DimensionToken.prototype.tokenType = "DIMENSION";




MemoryCSSPropertyBuffer.prototype.optimizedBufferSchema = BinarySchemaFactory(
	'compactedViewOnProperty',
	[

	],
	[

	]
);







module.exports = MemoryCSSPropertyBuffer;