/**
 * @constructor ComponentDataProvider
 */


var TypeManager = require('src/core/TypeManager');
var rDataset = require('src/core/ReactiveDataset');
var Components = require('src/core/Component');

//var Req = require('src/core/HTTPRequest');
var ObservedHTTPRequest = require('src/core/ObservedHTTPRequest');


// TODO: define a "MultiSlottedComponentDataProvider" type

var ComponentDataProvider = function(definition) {
	this.querySpecs = '';
	this.colName = [];
	this.dummyComponent = new Components.AbstractComponent(
		TypeManager.createComponentDef({UID: 'dummy'})
	);
}
ComponentDataProvider.prototype = Object.create(Object.prototype);

// CreateEvents shall be called only after that interface having been composed with a "real" component
ComponentDataProvider.prototype.createEvents = function() {
	this.createEvent('resize');
}

ComponentDataProvider.prototype.setAPIEntryPoint = function(querySpecs, colName) {
	
	this.querySpecs = typeof querySpecs === 'string' ? querySpecs : '';
	this.colName = typeof colName === 'string' ? colName : '';
}


ComponentDataProvider.prototype.getDataset = function(definition) {
//	console.log(definition, this.dataset, this.dummyComponent);
	if (this.dataset && !this.typedSlots)
		return;
	
	if (this.typedSlots && this.typedSlots.length)
		this.dataset = this.typedSlots[0];
	else
		this.dataset = new rDataset(
						this.dummyComponent,
						this.dummyComponent,
						definition.lists[0].getHostDef().template || TypeManager.mockDef(),
						this.colName,
						[]
		);
}

/**
 * @async
 */
ComponentDataProvider.prototype.acquireData = function(apiURL, permanent, blocking) {
//	console.log(this.colName);
	var self = this;
	var req = new ObservedHTTPRequest(
			this.objectType + '-' + this.colName, 	// request name
			null,
			apiURL,
			this.colName + this.querySpecs,
			this.dataPresenterFunc.bind(this)
		);

	(permanent && this.registerAsBlocking(req, blocking));

	req.sendRequest().then(function()  {
		var data = req.getResult();
		if (!data) {
			console.log('ObjectSetPresenter failed at consuming the response: no data extracted.', data);
			return;
		}
	
		self.dataset.pushApply(data);

		self.trigger('resize', {self_UID : self.UID});
	});
	
	return this.dataset;
}

ComponentDataProvider.prototype.registerAsBlocking = function(req, blocking) {
	TypeManager.permanentProvidersRegister.setItem(
		this._UID + '-' + this.colName,
		req,
		blocking
	);
}

ComponentDataProvider.prototype.dataPresenterFunc = function() {} 		// pure virtual















module.exports = ComponentDataProvider;