Object.defineProperty(String.prototype, 'splice', {
	enumerable : false,
	configurable : false,
	writable : false,
	value : function (index, count, add) {
		// We cannot pass negative indexes directly to the 2nd slicing operation.
		if (index < 0) {
			index = this.length + index;
			if (index < 0) {
				index = 0;
			}
		}
	
		return this.slice(0, index) + (add || '') + this.slice(index + count);
	}
});