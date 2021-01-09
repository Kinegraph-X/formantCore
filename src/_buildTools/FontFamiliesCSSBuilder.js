/**
 * @indexer FontFamiliesCSSBuilder
 * 
 */

var fs = require('fs');
var mongoose = require('mongoose');



var db = mongoose.connection;
var DBTypes = require('../_DesignSystemManager/DBTypes');

function deferedStringTemplate([first, ...rest]) {
  return (...values) => rest.reduce((acc, str, i) => acc + values[i] + str, first);
}

module.exports = function(grunt, done) {
//	console.log(done, this);
	
	var connected = mongoose.connections.length === 2 ? true : false, connectionError = false;
	
	
	var emptyDB = async function() {
		await mongoose.connect(
			'mongodb://localhost:27017/design_system',
			{
				useCreateIndex: true,
				useNewUrlParser: true,
				useUnifiedTopology: true,
				useFindAndModify: false,
				serverSelectionTimeoutMS: 3000
			}
		).then(function() {
			connected = true;
		}).catch(function(e){
			connectionError = true;
			console.error('moongoose connection caught error on FontFamiliesCSSBuilder');
		});
		
		if (connected !== true)
			return;
		
		await DBTypes.FontDef.deleteMany({});
	
	
//	console.log('FontFamiliesCSSBuild');
	
	
		var CSSString = '';
	
		var template = deferedStringTemplate`
				/* ${null} */
				@font-face {
					font-family: '${null}';
					font-style: ${null};
					font-weight: ${null};
					src: local(''),
						url('../fontlib/${null}');
				}
	`;
	
		var CSSFolderContent = grunt.file.expand({ cwd: 'plugins_spip/spip_baseApp/fontlib/'}, '*' );
	
		var proms = [];
	
		var dummyFontDef;
		var filledTemplate, extension, name, typeName, fontStyle;
		var doc, populateDB;
		
		
		CSSFolderContent.forEach(function(filename, key) {
	//		console.log(filename);
			
			dummyFontDef = {
				objectType : 'fontDef',
				family : '',
				style : '',
				weight : 400
			};
			
			name = filename.match(/^([A-Za-z]+)([\w-_]*)(\.\w{3})$/);
			if (!name || name[3].indexOf('jpg') !== -1)
				return;
			
			extension = name[3];
			dummyFontDef.family = typeName = name[1] + name[2];
			fontStyle = (fontStyle = name[2].match(/[A-Z][a-z]+$/)) ? fontStyle[0].replace(/-/g, '').toLowerCase() : name[2].replace(/-/g, '').toLowerCase();
			fontWeight = name[2].match(/bold/i) ? 800 : (name[2].match(/medium|condensed/i) ? 200 : (name[2].match(/thin|light|ultra-?condensed/i) ? 100 : 400));
			dummyFontDef.style = fontStyle;
			dummyFontDef.weight = fontWeight;
			name = typeName;
			
			filledTemplate = template(name, typeName, fontStyle, fontWeight, filename).replace(/\t{3}/g, '');
			
			
			doc = new DBTypes.FontDef(dummyFontDef);
			doc.isNew = true;
//			console.log(doc);
			populateDB = async function(name, doc) {
				var res = await doc.save();
				if (res === doc)
					console.log('"' + name + '"   has been saved to db');
				else {
					console.error('Save to db Error for ' + name);
				}
			};
			proms.push(populateDB(name, doc));	
			
			
			CSSString += filledTemplate;
		});
	
	//	console.log(process.cwd());
		fs.writeFileSync('plugins_spip/spip_baseApp/css/fontList.css', CSSString);
	
		Promise.all(proms).then(function(res) {
			done();
		});
	
	}
	
	emptyDB();
}