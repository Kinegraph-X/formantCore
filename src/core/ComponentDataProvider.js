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

ComponentDataProvider.prototype.setAPIEntryPoint = function(querySpecs, colName) {
	
	this.querySpecs = typeof querySpecs === 'string' ? querySpecs : '';
	this.colName = typeof colName === 'string' ? colName : '';
}

ComponentDataProvider.prototype.getcolName = function(colName) {
//	if (Array.isArray(colName))
		return colName;
//	else
//		return null;
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
ComponentDataProvider.prototype.acquireData = async function(apiURL) {
//	console.log(this.colName);
	var self = this;
	var req = TypeManager.permanentProvidersRegister.setItem(
		this.objectType + '-' + this.colName,
		new ObservedHTTPRequest(
			this.objectType + '-' + this.colName, 	// request name
			null,
			apiURL,
			this.colName + this.querySpecs,
			this.dataPresenterFunc.bind(this)
		)
	);
	
	var data;
	await req.sendRequest().then(function()  {
		data = req.getResult();
	
//		console.log(data);
		
		if (!data) {
			console.log('ObjectSetPresenter failed at consuming the response: no data extracted.', data);
			return;
		}
	
		self.dataset.pushApply(data);
		
		if (self.streams.updateTrigger)
			self.streams.updateTrigger.value = 'initialized through ComponentDataProvider';
	});
	
//	return req;
}

ComponentDataProvider.prototype.dataPresenterFunc = function() {} 		// pure virtual















module.exports = ComponentDataProvider;