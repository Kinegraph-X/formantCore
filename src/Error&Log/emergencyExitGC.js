/**
 * @constructor EmergencyExitGC
*/

var Factory = require('../core/Factory');
//var audioSource = require('../renderers/audioSource');

var classConstructor = function() {
	var context = this.context;
	
//	var objects = {
//			'audioSource' : audioSource(context).getInstance()
//	};

	var EmergencyExitGC = function() {
		Factory.CoreModule.call(this);
		this._registeredObjects = [];
		this.createEvent('exit');
		console.log('EmergencyExitGC created');
	//	this.onexit = this.deleteRegisteredObjects.bind(this);
		window.onbeforeunload = function() {
			console.log('onbeforeunload EmergencyExitGC called');
	//		this.trigger('exit');
			this.deleteRegisteredObjects();
			return 'WebApp Memory Cleaning: Click OK to leave';
		}.bind(this);
	}
EmergencyExitGC.prototype = Object.create(Factory.CoreModule.prototype);EmergencyExitGC.prototype.objectType = 'EmergencyExitGC';

	
	EmergencyExitGC.prototype.registerObjectForDeletion = function(parent, objName, removeEvent, handler) {
		this._registeredObjects.push([parent, objName, removeEvent, handler]);
	}
	
	EmergencyExitGC.prototype.deleteRegisteredObjects = function() {
		for (var i = 0, l = this._registeredObjects.length; i < l; i++) {
			if (typeof this._registeredObjects[i][0][this._registeredObjects[i][1]] !== 'undefined') {
				if (typeof this._registeredObjects[i][2] === 'string')
					this._registeredObjects[i][0][this._registeredObjects[i][1]].removeEventListener(this._registeredObjects[i][2], this._registeredObjects[i][3]);
				delete this._registeredObjects[i][0][this._registeredObjects[i][1]];
//				console.log('%c %s %c %s', 'color:#FF3311', 'cleared', 'color:#AA7755', JSON.stringify(this._registeredObjects[i]));
			}
//			delete this._registeredObjects[i];
		}
	}
	
	var instance = new EmergencyExitGC();
	return instance;
}

classConstructor.__factory_name = 'EmergencyExitGC';
var factory = Factory.Maker.getSingletonFactory(classConstructor);
//module.exports = factory;