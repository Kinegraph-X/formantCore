/**
 * Method sortByPropName
 * 
 * returns Array(obj[propNameA], obj[propNameB], obj[propNameC], etc.)
 */
Object.defineProperty(Object.prototype, 'sortSelfByPropName', {
	writable : false,
	value : function () {
		var keys = Object.keys(this).sort();

		var newObj = {}; 
		for(var i = 0, l = keys.length; i < l; i++) {
			newObj[keys[i]] = this[keys[i]];
		}
		return newObj;
	}
});

Object.defineProperty(Object.prototype, 'sortObjectByPropName', {
	value : function (obj) {
		var arr = Object.keys(obj).sort(), newObj = {};
		for (var key in arr) {
			newObj[arr[key]] = obj[arr[key]];
		}
		return newObj;	
	}
});





// As the Array ctor inherits from the Object ctor,
// any method present on Object.prototype should be available on Array
Object.defineProperty(Object.prototype, 'toDebugString', {
	value : function() {
		return JSON.stringify(Object.fromEntries(Object.entries(this)));
	}
});





























