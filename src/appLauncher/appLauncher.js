/**
 * @module appLauncher
 */

// Get compatibility with node.js and standalone engines
//if (typeof window === 'undefined') {
//	if (typeof global === 'undefined')
//		window = this;
//	else
//		window = global;
//}

// TODO : Should not polute the namespace of this function : think seriously of removing the affectation to vars, as we only need to "execute" the require

if (typeof Object.getOwnPropertyDescriptor(String.prototype, 'escapeRegExp') === 'undefined') { 
	var Str = require('src/extendedNative/string');
	var Arr = require('src/extendedNative/array');
	var Bool = require('src/extendedNative/boolean');
	var Obj = require('src/extendedNative/object');
	var Regex = require('src/extendedNative/regexp');
}
var Validate = require('src/UI/integrated_fork/Validate');
var Hamster = require('src/integrated_libs_&_forks/Hamster');
//var MasterTimer = require('src/timers/MasterTimer');
var NodeResizeObserver = require('src/core/ResizeObserver');
var TextSizeGetter = require('src/core/TextSizeGetter');

// TODO: move the main dependancies to permanent include
// Ensure that ctor is required at least once : it is responsible for dependancy injection (moved to index.js...  shall be moved to browserify permanent include)
//var rDataset = require('src/core/ReactiveDataset');

var classConstructor = (function() {	
	var debugMode = false,
//		masterTimer = new MasterTimer(),
		resizeObserver = new NodeResizeObserver(),
		textSizeGetter = new TextSizeGetter(),
		options = {
			
		},
		baseAppDefaultOptions = {
			UIDPrefix : '',
			APIurl : ''
		},
		baseApp = {},
		currentHostPath,
		browserName,
		knownIDs = {};
	

	var launch = function(customOptions) {
		
		debugMode = window.location && window.location.href.match(/[\?&]debug=(.+)&?/)
		if (debugMode && debugMode[0])
			debugMode = debugMode[0];
		
		Object.assign(options, baseAppDefaultOptions);
		if (typeof customOptions === 'object' && Object.keys(customOptions).length) {
			for(var prop in customOptions) {
				if (customOptions.hasOwnProperty(prop))
					options[prop] = customOptions[prop];
			};
		}
		
		// ensure we have an underscore at the end of the "app specific" prefix
		options.UIDPrefix = (options.UIDPrefix.lastIndexOf('_') === options.UIDPrefix.length - 1) ? options.UIDPrefix : options.UIDPrefix + '_';
		
		// helper styles
//		require('src/UI/styles/helperStyles')(context).getInstance();
		
		// Validate init
		Validate.options = {format: "flat"};
		
		currentHostPath = window.location && window.location.href.match(/(.*\/)[^/]*$/)[1];
		browserName = parseUserAgent();
		
//		masterTimer.startQueue();
	}
	
	var parseUserAgent = function() {
		var UA = window.navigator && window.navigator.userAgent;
		
		// Mobile
		if (/iPad/i.test(UA) || /iPhone/i.test(UA)) {
			var webkit = /WebKit/i.test(UA);
			if (iOS && webkit && !/CriOS/i.test(UA))
				return 'IOSsafari';
		}
		// Desktop
		else if(/Firefox/.test(UA) && !/Seamonkey/.test(UA))
			return 'Firefox';
		else if(/Seamonkey/.test(UA))
			return 'Seamonkey';
		else if(/Chrome/.test(UA) && !/Chromium/.test(UA))
			return 'Chrome';
		else if(/Chromium/.test(UA))
			return 'Chromium';
		else if(/Safari/.test(UA) && !/Chrome/.test(UA))
			return 'Safari';
		else if(/OPR/.test(UA))
			return 'Opera15+';
		else if(/Opera/.test(UA))
			return 'Opera12-';
		else if(/MSIE/.test(UA))
			return 'MSIE';
	}
	
	var checkSupport = function() {
		if (this.browserName === 'IOSsafari') {
			console.log('This App is not designed for Safari on IOS : Web Audio API support is missing');
			return false;
		}
		return true;
	}
	
	var getUID = function(uniqueID) {
		if (knownIDs.hasOwnProperty(options.UIDPrefix + uniqueID)) {
//			console.log(options.UIDPrefix + uniqueID);
			return knownIDs[options.UIDPrefix + uniqueID];
		}
		else if (knownIDs.hasOwnProperty(uniqueID)) {
//			console.log(uniqueID);
			return knownIDs[uniqueID];
		}
		else if (!knownIDs.hasOwnProperty(options.UIDPrefix + uniqueID) || !uniqueID || !uniqueID.length) {
			uniqueID = uniqueID ? (options.UIDPrefix + uniqueID) : (options.UIDPrefix + (Math.round(Math.random() * 10000)).toString());
			knownIDs[uniqueID] = uniqueID;
			return knownIDs[uniqueID];
		}
	}
	
	var isKnownUID = function(uniqueID) {
		return getUID(uniqueID);
	}
	
	var setUID = function(uniqueID, globalObj) {
		return (knownIDs[uniqueID] = globalObj);
	}
	
	return {
		debugMode : debugMode,
		resizeObserver : resizeObserver,
		textSizeGetter : textSizeGetter,
		TextSizeGetterCtor : TextSizeGetter,
		options : options,
		launch : launch,
		checkSupport : checkSupport,
//		locks : locks,
//		knownIDs : knownIDs,
		getUID : getUID,
		isKnownUID : isKnownUID,
		setUID : setUID,
		currentHostPath : currentHostPath,
		browserName : browserName
	}
})();

//classConstructor.__factory_name = 'appLauncher';
//var factory = Factory.Maker.getSingletonFactory(classConstructor);
//module.exports = factory;

module.exports = classConstructor;
