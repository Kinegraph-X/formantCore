/**
 * @module appLauncher
 */

var Factory = require('src/core/Factory');

var classConstructor = function() {
	
	var context = this.context;
	var baseAppDefaultOptions = {};
	var baseApp = {};

	var launch = function(options) {
		if (typeof options !== 'undefined')
			this.options = $.arrayMerge([], options, baseAppDefaultOptions);
		else
			this.options = baseAppDefaultOptions;
		this.currentHostPath = window.location.href.match(/(.*\/)[^/]*$/)[1];
		this.browserName = parseUserAgent();
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
	
	return {
		launch : launch,
		checkSupport : checkSupport
	}
}

classConstructor.__factory_name = 'appConstants';
var factory = Factory.Maker.getSingletonFactory(classConstructor);
module.exports = factory;