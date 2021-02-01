/**
 * @constructor RichComponentInternalsPicker
 */

var appConstants = require('src/appLauncher/appLauncher');
var TypeManager = require('src/core/TypeManager');
var CoreTypes = require('src/core/CoreTypes');

var Logger = require('src/Error&Log/Logger');

var DomToImageWorker = require('src/workers/DomToImage.worker');


var RichComponentInternalsPicker = function(config, action) {
	this._pickingProcedure = [];
	
	if (config && Array.isArray(config)) {
		config.forEach(function(method) {
			if (typeof this[method] === 'function')
				this._pickingProcedure.push(this[method]);
		}, this);
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


/**
 * Already on HierarchicalObject.prototype
 * (we also have getDescendantsAsNameTree(component))
// */
//RichComponentInternalsPicker.prototype.getDescendantsAsKeyValueTree = function(component) {
//	
//}

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
	resolve(e.data.boundingBox);
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



RichComponentInternalsPicker.prototype.handleComponentInStatesTree = function(component) {
	
}























module.exports = RichComponentInternalsPicker;
