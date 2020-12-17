module.exports = function (grunt, options) {
	// example using options.currentProject as an alternative to the self expanding string mechanism '<%=currentProject%>'
		
	var baseWord = new RegExp(options.baseWord, 'gi'),
		componentWord = new RegExp(options.componentWord, 'gi');
	
	return {
		newCoreComponent: {
			expand: true,
			cwd: '<%=pathToTemplate%>',
			src: [
				'**'
				],
			dest: '<%=pathToProject%>',
			rename : function(dest, src) {
				if (src.match(baseWord))
					src = src.replace(baseWord, '<%=currentProject%>');
				return dest + src;
			},
			options :{
				process : function(content, srcpath) {
					if (srcpath.match(/(.+\.js)$/)) {
						content = content.replace(componentWord, options.componentName);
					}
					return content;
				}
			}
		}
	};
}