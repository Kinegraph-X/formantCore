Object.defineProperty(Boolean.prototype, 'tryParse', {
	enumerable : false,
	configurable : false,
	writable : false,
	value : function(val) {
//		console.log('tryParse', typeof val);
		if (typeof val !== 'string')
			return val;
		else {
			if (val === 'false')
				return false;
			else if (val === 'true')
				return true;
			else
				return val;
		}
	}
});