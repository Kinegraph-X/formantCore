/**
 * @indexer UIpackageList
 * 
 */

const fs  = require('fs');

module.exports = function(grunt, options) {
	
	var categories = {
//			none : [],
//			minimal : ['minimal'],		// minimal bundling is broken, don't use until big fix
//			special : ['special'],
//			video : ['video'],
//			std : ['minimal', 'boxes', 'panels', 'structs', 'titles'],
			all : ['basics', 'forms', 'lists', 'tables', 'tabs', 'trees', 'specials']
	}
	
	options = options || {};
//	var componentLibPath =options.rootPath + 'jsComponentLib/src/';
	
	// UI package : "minimal" by default
	options.UIpackage = options.UIpackage;
	var UIpackageList = {};
	options.UIpackageList = [];
	// Validators : -all- (guess : we'll only validate "text" inputs... TODO : what should be validated ? "editable node" content (from a char table))
	var UIvalidatorList = {};
	options.UIvalidatorsList = [];
	var packageTree = {}, validatorTree = [];
	
	if (grunt && fs.existsSync(grunt.config.data.rootPath + 'jsComponentLib/src/')) {
		var packageFolders = grunt.file.expand({cwd : grunt.config.data.rootPath + 'jsComponentLib/src/UI/categories/'}, '*!(_Base|copy)');
		var validatorTree = grunt.file.expand({cwd : grunt.config.data.rootPath + 'jsComponentLib/src/UI/categories/validators/'}, '*');
		
		// list 1 level deeper to get filenames
		packageFolders.forEach(function(folder, key) {
			packageTree[folder] = grunt.file.expand({cwd : grunt.config.data.rootPath + 'jsComponentLib/src/UI/categories/' + folder + '/'}, '*');
		});
		
		// write categories paths as a flat 2 dimensional array, validators as a 1 dimensional array 
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
	
	// some files call this helper to get the list of validators and pass null as UIpackage
	if (typeof categories[options.UIpackage] !== 'undefined') {
		categories[options.UIpackage].forEach(function(dir) {
			options.UIpackageList = options.UIpackageList.concat(
					packageTree[dir].map(function(item) {
						path = '';
						if (item.indexOf('.js') === -1)
							path = '/' + item + '.js';
						item = item.replace(/\.\w{2,3}$/, '');
						path = 'src/UI/categories/' + dir + '/' + item + path;
						UIpackageList[item] = path;
						return path;
						})
				);
		});
	}
	
	validatorTree = validatorTree.map(function(file) {
		path = 'src/UI/categories/validators/' + file.slice(0, -3);
		UIvalidatorList[file.slice(0, -6)] = path;
		return path;
	});
	options.UIvalidatorsList = validatorTree;

	if (!grunt)
		return {packageList : UIpackageList, validatorList : UIvalidatorList};

};