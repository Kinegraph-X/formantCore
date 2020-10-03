/**
 * @module appLauncher
 */

var Factory = require('src/core/Factory');
// TODO : Should not polute the namespace of this function : think seriously of removing the affectation to vars, as we only need to "execute" the require 
var Str = require('src/extendedNative/string');
var Arr = require('src/extendedNative/array');
var Bool = require('src/extendedNative/boolean');
var Obj = require('src/extendedNative/object');
var Regex = require('src/extendedNative/regexp');
var Validate = require('src/validate_js/validate');

var classConstructor = function() {	
	var context = this.context,
		options = {},
		baseAppDefaultOptions = {
			UIDPrefix : ''
		},
		baseApp = {},
		currentHostPath,
		browserName,
		knownIDs = {};
	

	var launch = function(customOptions) {
		options = baseAppDefaultOptions;
		if (typeof customOptions === 'object' && Object.keys(customOptions).length) {
			for(var prop in customOptions) {
				if (customOptions.hasOwnProperty(prop))
					options[prop] = customOptions[prop];
			};
		}
		// ensure we have an underscore at the end of the "app specific" prefix
		options.UIDPrefix = (options.UIDPrefix.lastIndexOf('_') === options.UIDPrefix.length - 1) ? options.UIDPrefix : options.UIDPrefix + '_';
		
		// helper styles
		require('src/UI/styles/helperStyles')(context).getInstance();
		// Validate init
		Validate.options = {format: "flat"};
		
		currentHostPath = window.location.href.match(/(.*\/)[^/]*$/)[1];
		browserName = parseUserAgent();
	}
	
	var parseUserAgent = function() {
		var UA = window.navigator.userAgent;
		
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
//			console.log(uniqueID, knownIDs);
			return knownIDs[options.UIDPrefix + uniqueID];
		}
		else if (!knownIDs.hasOwnProperty(options.UIDPrefix + uniqueID) || !uniqueID || !uniqueID.length) {
			uniqueID = uniqueID ? (options.UIDPrefix + uniqueID) : (options.UIDPrefix + ($.guid++).toString());
			knownIDs[uniqueID] = uniqueID;
			return knownIDs[uniqueID];
		}
		else if (knownIDs.hasOwnProperty((uniqueID || ''))) // Hacky : knownIDs.hasOwnProperty('') won't ever return truthy
			return knownIDs[uniqueID];
	}
	
	var isKnownUID = function(uniqueID) {
		return getUID(uniqueID);
	}
	
	var setUID = function(uniqueID, globalObj) {
		return (knownIDs[uniqueID] = globalObj);
	}
	
	// jQuery UI implements some lock-mechanisms to prevent interfaces being used at the same time by two widgets
	// Now we've integrated some widgets as native components, let's try to keep track of those locks at our app level
	var locks = {
			mouseHandled : false
	}
	document.addEventListener("mouseup", function() {
		locks.mouseHandled = false;
	});
	
	return {
		launch : launch,
		checkSupport : checkSupport,
		locks : locks,
		getUID : getUID,
		isKnownUID : isKnownUID,
		setUID : setUID,
		currentHostPath : currentHostPath,
		browserName : browserName
	}
}

classConstructor.__factory_name = 'appLauncher';
var factory = Factory.Maker.getSingletonFactory(classConstructor);
module.exports = factory;
