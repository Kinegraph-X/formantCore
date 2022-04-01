/**
 * @constructor StylesheetsCollector
*/

var TypeManager = require('src/core/TypeManager');
var CoreTypes = require('src/core/CoreTypes');
var Components = require('src/core/Component');
var AbstractStylesheet = require('src/editing/AbstractStylesheet');
var AdvancedAttributesList = require('src/editing/SplittedAttributes');

// require CSS-parser...
var parser = require('src/parsers/css-parser_forked');

var StylesheetsCollector = function(originLocation, needsSync) {
	var self = this;
	
	CoreTypes.EventEmitter.call(this);
	this.objectType = 'StylesheetsCollector';
	this.collectedSWrappers;
	
	if (needsSync) {
		// Listen to resize observer or document.onload and call getUsefullStylesheets
		document.addEventListener('load', function(e) {
			self.collectedSWrappers = self.getUsefulStylesheets();
		});
	}
	else
		self.collectedSWrappers = self.getUsefulStylesheets();
}
StylesheetsCollector.prototype = Object.create(CoreTypes.EventEmitter.prototype);
StylesheetsCollector.prototype.objectType = 'StylesheetsCollector';

//StylesheetsCollector.prototype.createEvents = function() {
//	this.createEvent('ready');
//}

StylesheetsCollector.prototype.getUsefulStylesheets = function() {
	var collectedSWrappers = [];
	for (var sheet of document.styleSheets) {
		// sheets that have a -not null- href property are externaly loaded
		if (sheet.href)
			collectedSWrappers.push(this.expandToSWrapper(sheet));
	}
	return collectedSWrappers;
}

StylesheetsCollector.prototype.convertToCSSPropertySetBuffer = function(styleRule) {
	if (!styleRule.style || !styleRule.style.cssText)
		return {};
		
	// parse the rule and populate a raw style object
	var ast = parser.parseAListOfDeclarations(styleRule.style.cssText);
	
	return AdvancedAttributesList.fromAST(ast); //.getAllDefinedAttributes();		// was meant to be "raw", let's keep for now the helper functions on the "advanced" type (non-raw...)
//	console.log(ast);
}

StylesheetsCollector.prototype.compactToJSON = function(styleSheet) {
	// get the rules as "native" obj and prepare for transfer
}

StylesheetsCollector.prototype.expandToSWrapper = function(styleSheet) {
	// get the rules as "native" obj and instantiate an AbstractStyleSheet
	var rawStyle = [], tmpRawStyleObj;
	for (var rule of styleSheet.cssRules) {
		tmpRawStyleObj = this.convertToCSSPropertySetBuffer(rule);
		if (tmpRawStyleObj.selector = this.isolateSelector(rule))
			rawStyle.push(tmpRawStyleObj);
	}
//	console.log(rawStyle);
	return new AbstractStylesheet(rawStyle, this.isolateFilename(styleSheet));
}

StylesheetsCollector.prototype.isolateSelector = function(styleRule) {
	return styleRule.selectorText;
}

StylesheetsCollector.prototype.isolateFilename = function(styleSheet) {
	var subStringObj = styleSheet.href.match(/[a-zA-Z0-9_&-]+\.css$/i);
	if (subStringObj)
		return subStringObj[0];
}







module.exports = StylesheetsCollector;