/**
 * @indexer v8Launcher

 * Exports a file named v8Launcher.js in the js/ folder of the bundle,
 * which shall call the main function of the bundle,
 * and then shall load any "filename".js given in the bundleConfig.json
 * at "ressourcePath".
 * 		=> for the v8 standalone engine to get some sample data
 * 			and then call the ${options.currentProject}Starter function
 * 			already exported to the global namespace
 * 
 */

module.exports = function(grunt, options) {
	// '"_buffer": { "0": 3, "1": 4, "2": 102, "3": 111, "4": 110, "5": 3, "6": 14, "7": 0 }'.replaceAll(/(_buffer":\s|occupancy":\s)(\{[^\}]+?\})/g, '$1new Uint8Array(Object.values($2))')
	// .replace(/"\d+":\s/g, '').replace(/\s\{([\s\d,]+)}/g, '[$1]')
	// '{ "0": 3, "1": 4, "2": 102, "3": 111, "4": 110, "5": 3, "6": 14, "7": 0 }'.replace(/"\d+":\s(?=\d)/g, "").replace(/\{([\s\d,]+)\}/g, "[$1]")
	var str = `
	
	var TypedArrayNamesRegExp = new RegExp('(_buffer|occupancy)(":\\\\s?)(\\\\{[^\\\\}]+\\\\})', 'g');
	
	var formatObjFromConsoleLog = function (strFromConsole) {
		
		return strFromConsole
				.replace(
					TypedArrayNamesRegExp,
					'$1$2new Uint8Array($3)'
				)
				.replace(/"\\d+":\\s?(?=\\d)/g, "")
				.replace(/\\{([\\s\\d,]+)\\}/g, "[$1]");
	}
	
	load('${grunt.config.data.currentProject}/js/${grunt.config.data.currentProject}.debug.js');
	var datasetsAsEventPayload = {data : {}};
	[${grunt.config.data.ressourcePath.map(function(s) {return '"' + s + '"';})}].forEach(function(path) {
		datasetsAsEventPayload.data[path] = eval(formatObjFromConsoleLog(read("/Production Data/Git/plugins_spip/_Bundles/${grunt.config.data.currentProject}/js/" + path + ".js")));
	});
	${options.currentProject}Starter().init()(datasetsAsEventPayload);
	`;
//	console.log(options.pathToProject + 'js/v8Launcher.js');
	grunt.file.write(grunt.config.data.pathToProject + 'js/v8Launcher.js', str);
};