/**
 * @indexer UIpackageList
 * 
 */

const fs  = require('fs');

module.exports = function(grunt, options) {
	
	var packages = {
			none : [],
			minimal : ['minimal'],		// minimal bundling is broken, don't use until big fix
			special : ['special'],
			video : ['video'],
			std : ['minimal', 'boxes', 'panels', 'structs', 'titles'],
			all : ['minimal', 'boxes', 'overlays', 'panels', 'structs', 'setsForPanels', 'titles', 'video', 'special']
	}
	
	options = options || {};
//	var componentLibPath =options.rootPath + 'jsUIFramework/src/';
	
	// UI package : "minimal" by default
	options.UIpackage = options.UIpackage || 'minimal';
	var UIpackageList = {};
	options.UIpackageList = [];
	// Validators : -all- (guess : we'll only validate "text" inputs... TODO : what should be validated ? "editable node" content (from a char table))
	var UIvalidatorList = {};
	options.UIvalidatorsList = [];
	var packageTree = {}, validatorTree = [];
	
	if (grunt && fs.existsSync(grunt.config.data.rootPath + 'jsUIFramework/src/')) {
		var packageFolders = grunt.file.expand({cwd : grunt.config.data.rootPath + 'jsUIFramework/src/UI/packages/'}, '*!(_Base|copy)');
		var validatorTree = grunt.file.expand({cwd : grunt.config.data.rootPath + 'jsUIFramework/src/UI/validators/'}, '*');
		
		// list 1 level deeper to get filenames
		packageFolders.forEach(function(folder, key) {
			packageTree[folder] = grunt.file.expand({cwd : grunt.config.data.rootPath + 'jsUIFramework/src/UI/packages/' + folder + '/'}, '*');
		});
		
		// write packages paths as a flat 2 dimensional array, validators as a 1 dimensional array 
		var prefix = 'module.exports = (function() {return ',
			postfix = ';})();';
		
		grunt.file.write(grunt.config.data.pathToProject + 'cache/UIpackagesFolderCache.js', prefix + JSON.stringify(packageTree) + postfix);
		grunt.file.write(grunt.config.data.pathToProject + 'cache/UIvalidatorsFileCache.js', prefix + JSON.stringify(validatorTree) + postfix);
	}
	// if (fs.existsSync('cache/UIpackagesFolderCache.js') && fs.existsSync('cache/UIvalidatorsFileCache.js'))
	else  {
		packageTree = require('cache/UIpackagesFolderCache');
		validatorTree = require('cache/UIvalidatorsFileCache');
	}
	
	// remove file extension, concatenate the file paths from the desired folders
	// prepare the returned list (indexed on file names) to be used by the requiring code
	// and the exported list (basic array of path) to be used by browserify (automatic inclusion in the bundle)
	var path;
	packages[options.UIpackage].forEach(function(dir) {
		options.UIpackageList = options.UIpackageList.concat(
				packageTree[dir].map(function(item) {
					path = '';
					if (item.indexOf('.js') === -1)
						path = '/' + item + '.js';
					item = item.replace(/\.\w{2,3}$/, '');
					path = 'src/UI/packages/' + dir + '/' + item + path;
					UIpackageList[item] = path;
					return path;
					})
			);
	});
	validatorTree = validatorTree.map(function(file) {
		path = 'src/UI/validators/' + file.slice(0, -3);
		UIvalidatorList[file.slice(0, -6)] = path;
		return path;
	});
	options.UIvalidatorsList = validatorTree;

	if (!grunt)
		return {packageList : UIpackageList, validatorList : UIvalidatorList};

};