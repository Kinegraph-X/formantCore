/**
 * @constructor RichComponentInternalsPicker
 */

var appConstants = require('src/appLauncher/appLauncher');
var TypeManager = require('src/core/TypeManager');
var CoreTypes = require('src/core/CoreTypes');

var DomToImageWorker = require('src/workers/DomToImage.worker');


var RichComponentInternalsPicker = function(config) {
	this._pickingProcedure = [];
	
	if (config && Object.prototype.toString.call(config) === '[object Object]') {
		for (var prop in config) {
			if (config.hasOwnProperty(prop) && typeof this[config[prop]] === 'function')
				this._pickingProcedure.push(this[config[prop]]);
		}
	}
	else {
		this._pickingProcedure = [
			this.getBoundingBox,
			this.getSWrapper,
			this.getAsImage
		];
	}
}
RichComponentInternalsPicker.prototype = Object.create(CoreTypes.EventEmitter.prototype);

RichComponentInternalsPicker.prototype.collect = function(component) {
	var ret, promises = [];
	this._pickingProcedure.forEach(function(func) {
		ret = func(component);
		if (ret instanceof Promise)
			promises.push(ret);
	});
	return Promise.all(promises);
}

RichComponentInternalsPicker.prototype.getBoundingBox = function(component) {
	var self = this;

	var p = new Promise(function(resolve, reject) {
		var inter = setInterval(function() {
			if (component.view.getMasterNode()) {
				clearInterval(inter);
				(new Promise(function(resolve, reject) {
					appConstants.resizeObserver.observe(component.view.getMasterNode(), self.storeBoundingBox.bind(self, component, resolve));
				})).then(function() {resolve();});
			}
		}, 127);
	});
	return p;
}

RichComponentInternalsPicker.prototype.storeBoundingBox = function(component, resolve, e) {
	TypeManager.boundingBoxesCache.setItem(component._UID, e.data.boundingBox);
	resolve();
}

RichComponentInternalsPicker.prototype.getSWrapper = function(component) {
	if (component.view.sWrapper)
		TypeManager.sWrappersCache.setItem(component._UID, component.view.sWrapper);
}

RichComponentInternalsPicker.prototype.getAsImage = function(component) {
	var domElem;
	return new Promise(function(resolve, reject) {
		if (domElem = component.view.getMasterNode()) {
			var worker = new CoreTypes.Worker('DomToImageWorker', DomToImageWorker);
			worker.addResponseHandler(0, function(response) {
				component.view.imgData = response;
				resolve(response);
			});
			worker.postMessage('getImage', domElem);
		}
		else
			reject();
	});
}








module.exports = RichComponentInternalsPicker;
