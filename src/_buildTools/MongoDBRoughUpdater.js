/**
 * @databaseUtility MongoDBRoughUpdater
 * 
 */

var fs = require('fs');
var mongoose = require('mongoose');



var db = mongoose.connection;
var DBTypes = require('../_DesignSystemManager/DBTypes');


module.exports = function(grunt, done) {
//	console.log(done, this);
	
	var connected = mongoose.connections.length === 2 ? true : false, connectionError = false;
	
	
	var updateDB = async function() {
		await mongoose.connect(
			'mongodb://localhost:27017/themed_components',
			{
				useCreateIndex: true,
				useNewUrlParser: true,
				useUnifiedTopology: true,
				useFindAndModify: false,
				serverSelectionTimeoutMS: 3000
			}
		).then(function() {
			console.error('moongoose connection OK');
			connected = true;
		}).catch(function(e){
			connectionError = true;
			console.error('moongoose connection caught error on MongoDBRoughUpdater');
		});
		
		if (connected !== true)
			return;
		
		var componentStyles = await DBTypes.ComponentStyle.find();
//		console.error(componentStyles);
		
		componentStyles.forEach(async function(componentStyle, key) {
			console.log(componentStyle.componentName);
			
			var isUpToDate = false, hasAMargin = false, hasAPadding = false, 
				firstAppearanceOfHost = null,
				firstAppearanceOfInput = null;;
			
			componentStyle.props.forEach(function(rule, Idx) {
				if (firstAppearanceOfHost === null && rule.selector.match(/:host/)) {
					firstAppearanceOfHost = Idx;
				}
				if (firstAppearanceOfInput === null && rule.selector.match(/input/)) {
					firstAppearanceOfInput = Idx;
				}
				if (rule.selector.match(/:host/) && (rule.margin || rule.marginLeft || rule.marginTop))
					hasAMargin = true;
				if (rule.selector.match(/:host/) && rule.padding)
					hasAPadding = true;
			});
			
			if (hasAMargin || hasAPadding) {
				console.log('hasAMargin', hasAMargin);
				return;	
			}
			else {
				firstAppearanceOfHost = firstAppearanceOfHost || 0;
				componentStyle.props[firstAppearanceOfHost].margin = '0';
				componentStyle.props[firstAppearanceOfHost].padding = '0';
				componentStyle.props[firstAppearanceOfHost].border = '0';
				componentStyle.props[firstAppearanceOfHost].outline = '0';
				componentStyle.props[firstAppearanceOfHost].background = '0';
				componentStyle.props[firstAppearanceOfHost].boxShadow = '0';
				componentStyle.props[firstAppearanceOfHost].verticalAlign = 'baseline';
				
				if (firstAppearanceOfInput !== null && componentStyle.componentName !== 'ColorSwatchComponent') {
					componentStyle.props[firstAppearanceOfInput].margin = '0';
					componentStyle.props[firstAppearanceOfInput].padding = '0';
					componentStyle.props[firstAppearanceOfInput].border = '0';
					componentStyle.props[firstAppearanceOfInput].outline = '0';
					componentStyle.props[firstAppearanceOfInput].background = '0';
					componentStyle.props[firstAppearanceOfInput].boxShadow = '0';
					componentStyle.props[firstAppearanceOfInput].verticalAlign = 'baseline';
				}
				var doc = await componentStyle.save();
				
				console.log(firstAppearanceOfHost, doc.props[firstAppearanceOfHost].boxSizing);
			}
			
		});

//		Promise.all(proms).then(function(res) {
			done();
//		});
	
	}
	
	updateDB();
}