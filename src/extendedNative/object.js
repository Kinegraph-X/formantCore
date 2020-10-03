/**
 * Method sortByPropName
 * 
 * returns Array(obj[propNameA], obj[propNameB], obj[propNameC], etc.)
 */
Object.defineProperty(Object.prototype, 'sortByPropName', {
	writable : false,
	value : function () {
		var keys = Object.keys(this).sort();
//		console.log(keys.join(''))
		var arr = []; 
		for(var i = 0, l = keys.length; i < l; i++) {
			arr.push(this[keys[i]]);
		}
		return arr;
	}
});

