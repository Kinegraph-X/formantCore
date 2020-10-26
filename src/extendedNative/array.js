

Object.defineProperty(Array.prototype, 'populateNewObj', {
	writable : true,
	value : function() {
		this.members = 0;
		this.sum = 0;
		this.sumSquares = 0;
		this.md = 0;
		this.avg = 0;
		this.rms = 0;
	}
});

Object.defineProperty(Array.prototype, 'average', {
	writable : false,
	value : function (newValue) {
		if (typeof this.sum === 'undefined')
			this.populateNewObj();
		if (typeof newValue !== 'undefined') {
			this.push(newValue);
			this.sum += newValue;
		}
		this.avg = this.sum / (this.members || this.length);
	}
});
Object.defineProperty(Array.prototype, 'sortNumeric', {
	writable : false,
	value : function () {
		function compareNumbers(a, b) {
			return a - b;
		}
		this.sort(compareNumbers);
	}
});
Object.defineProperty(Array.prototype, 'median', {
	writable : false,
	value : function(value) {
		if (typeof this.md === 'undefined')
			this.populateNewObj();
		if (typeof value === 'undefined') {
			this.sortNumeric();
			this.md = this[Math.floor(this.length / 2)];
		}
		else
			this.md = value;
	}
});
Object.defineProperty(Array.prototype, 'rmsCompute', {
	writable : false,
	value : function (newValue) {
		if (typeof this.sum === 'undefined')
			this.populateNewObj();
		if (typeof newValue !== 'undefined') {
			this.push(newValue);
			this.sum += newValue;
		}
		this.sumSquares = 0;
		if (typeof this.avg !== 'undefined') {
			for (var i = 0; i < this.length; i++) {
				this.sumSquares += Math.pow(this[i] - this.avg, 2);
			}
		}
		else
			console.error('Array Exception : rms Compute without defining average value');
		this.rms = Math.sqrt(this.sumSquares / this.members || this.length);
	}
});
Object.defineProperty(Array.prototype, 'intersectOnCommonKey', {
	writable : false,
	value : function (b, commonKey) {
		var a = this,
	      lastIndex = 0,
	      result,
	      shortLen, longLen, i, j, k;
		
	    if (b.length > a.length) {
	      a = b;
	      b = this;
	    }
	    
	    shortLen = b.length;
	    longLen = a.length;
	    result = Array(shortLen);
	    k = 0;
	    
	    for (i = 0; i < shortLen; i++) {
	      for (j = lastIndex; j < longLen; j++) {
	        if (b[i][commonKey] == a[j][commonKey]) {
	          result[k] = b[i];
	          k++;
	          lastIndex = j + 1;
	          break;
	        }
	      }
	    }
	    return result.slice(0, k);
	  }
});

Object.defineProperty(Array.prototype, 'filterOnCommonKey', {
	writable : false,
	value : function (b, commonKey) {
		
		
		var a = this,
	      lastIndex = 0,
	      result,
	      shortLen, longLen, i, j, k;
		
	    if (b.length > a.length) {
	      a = b;
	      b = this;
	    }
	    
	    shortLen = b.length;
	    longLen = a.length;
	    result = Array(shortLen);
	    k = 0;
	    
	    for (i = 0; i < shortLen; i++) {
	      if (a.findIndex(function(el) {return el[commonKey] === b[i][commonKey]}) !== -1) {
	    	result[k] = b[i];
	      	k++;
	      }
	    }
	    return result.slice(0, k);
	  }
});

Object.defineProperty(Array.prototype, 'append', {
	writable: false,
	value : function (array2, position) {
		var or = this.slice(0);
		if (typeof position !== 'undefined') {
			for (var i = 0, j = 0, l = this.length, L = array2.length; i < l + L; i++) {
				if (i > position) {
					if (j < L) {
						this[i] = array2[j];
						j++;
					}
					else
						this[i] = or[i - L]; 
				}
			}
		}
		else if (typeof position === 'undefined'){
			for (var j = 0, l = this.length, L = array2.length; j < L; j++) {
				this[j + l] = array2[j];
			}
		}
	}
});

Object.defineProperty(ArrayBuffer.prototype, 'append', {
	enumerable : false, 	// not necessary : false is the default value
	writable: false,
	value : function (buffer2, position, filesize) {
			var tmp, a, b, ret;
			a = new Uint8Array(this);
			b = new Uint8Array(buffer2);

			try {
			  if (typeof position !== 'undefined') {
				  tmp = new Uint8Array(new ArrayBuffer(filesize));
				  tmp.set(a, 0);
				  tmp.set(b, position);
			  }
			  else {
				  tmp = new Uint8Array(this.byteLength + buffer2.byteLength);
				  tmp.set(a, 0);
				  tmp.set(b, this.byteLength);
			  }
			}
			catch (e) {
				console.error(e);
			}
			
			ret = tmp.buffer.slice(0, tmp.buffer.byteLength);
			
			a = b = tmp = undefined;
			
			delete a;
			delete b;
			delete tmp;

			return ret;
		}
	}
);


Object.defineProperty(Array.prototype, 'hasObjectByKey', {
	value : function(key) {
		for (let i = 0, l = this.length; i < l; i++) {
			if (typeof this[i][key] !== 'undefined' || this[i].hasOwnProperty(key))
				return true;
		}
		return false;
	}
});

Object.defineProperty(Array.prototype, 'findObjectByKey', {
	value : function(key) {
		for (let i = 0, l = this.length; i < l; i++) {
			if (typeof this[i][key] !== 'undefined' || this[i].hasOwnProperty(key))
				return this[i];
		}
		return false;
	}
});

Object.defineProperty(Array.prototype, 'findObjectByValue', {
	value : function(prop, value) {
		for (let i = 0, l = this.length; i < l; i++) {
			if (this[i][prop] === value)
				return this[i];
		}
		return false;
	}
});

Object.defineProperty(Array.prototype, 'indexOfObjectByKey', {
	value : function(key) {
		for (let i = 0, l = this.length; i < l; i++) {
			if (typeof this[i][key] !== 'undefined' || this[i].hasOwnProperty(key))
				return i;
		}
		return false;
	}
});


sortObject = function (obj) {
	var arr = Object.keys(obj).sort(), newObj = {};
	for (var key in arr) {
		newObj[arr[key]] = obj[arr[key]];
	}
	return newObj;
}

//Object.defineProperty(ArrayBuffer.prototype, 'bufferToString', {
//	writable : false,
//	value : function () {
//		var str;
//		for(var i = 0, l = this.byteLength; i < l; i++) {
//			str += String.prototype.fromCharCode.call(null, this[i]);
//		}
//		return str;
//	}
//});

