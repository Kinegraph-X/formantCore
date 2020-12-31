/**
 * @constructor ComponentDataProvider
 */


var TypeManager = require('src/core/TypeManager');
var rDataset = require('src/core/ReactiveDataset');
var Components = require('src/core/Component');

var Req = require('src/core/HTTPRequest');


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
	this.colName = this.getcolName(colName);
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

ComponentDataProvider.prototype.acquireData = async function() {
//	console.log(this.colName);
	var data;
	var response = await new Req('GET', 'http://servers.localhost:8080/' + this.colName + this.querySpecs, null, null, 'application/json', 'json').
		catch(function(e) {	// e may be an array containing the max amount of data that the request handler has gathered
			console.log('HTTP async error caught');
			// prettyArrayLogger(e);
		});
	if (!response || Object.prototype.toString.call(response) !== '[object Object]') {
		// response may also be an array
		// prettyArrayLogger(e);
		console.log('ObjectSetViewer didn\'t received any data: ', response);
		console.log('Or wrong data-type: ', Object.prototype.toString.call(response));
		return;
	}
	try {
		// try/catch as the dataPresenter function is likely to always be outside of our scope
		data = this.dataPresenterFunc(response);
	}
	catch (e) {
		console.log('Exception thrown while ObjectSetPresenter was consuming the response: ', e, data);
		return;
	};
	if (!data) {
		console.log('ObjectSetPresenter failed at consuming the response: no data extracted.', data);
		return;
	}
//	console.log(data);
	this.dataset.pushApply(data);
	
	if (this.streams.updateTrigger)
		this.streams.updateTrigger.value = 'initialized through ComponentDataProvider';
}

ComponentDataProvider.prototype.dataPresenterFunc = function() {} 		// pure virtual















module.exports = ComponentDataProvider;