/**
 * @constructor ComponentDataProvider
 */


var TypeManager = require('src/core/TypeManager');
var rDataset = require('src/core/ReactiveDataset');
var Components = require('src/core/Component');

var Req = require('src/core/HTTPRequest');


// TODO: define a "MultiSlottedComponentDataProvider" type

var ComponentDataProvider = function(definition) {
	this.APIEntryPoint = '';
	this.dataBoundColName = [];
	this.dummyComponent = new Components.AbstractComponent(
		TypeManager.createComponentDef({UID: 'dummy'})
	);
}
ComponentDataProvider.prototype = Object.create(Object.prototype);

ComponentDataProvider.prototype.setAPIEntryPoint = function(APIEntryPoint, dataBoundColName) {
	
	this.APIEntryPoint = typeof APIEntryPoint === 'string' ? APIEntryPoint : null;
	this.dataBoundColName = this.getdataBoundColName(dataBoundColName);
}

ComponentDataProvider.prototype.getdataBoundColName = function(dataBoundColName) {
	if (Array.isArray(dataBoundColName))
		return dataBoundColName;
	else
		return null;
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
						definition,
						this.dataBoundColName,
						[]
		);
}

ComponentDataProvider.prototype.dataPresenterFunc = function() {} 		// pure virtual















module.exports = ComponentDataProvider;