/**
 * HTTP Request API
 */

var Request = function(type, url, data, range, accept, result) {
	return this.xhr(type, url, data, range, accept, result);
};

Request.prototype.xhr = function(type, url, data, range, accept, result) {
	var self = this;
	if (type === 'HEAD_GET')
		type = 'GET';
	
	return new Promise(function(resolve, reject){
		var xhr = new XMLHttpRequest();
		xhr.open(type, url, true);
		
		if (!data)
			data = null;
		else if (type === 'POST') {
			xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
			var str = '', c = 0, last = Object.keys(data).length - 1;
			for(var key in data) {
				str += key + '=' + data[key] + (c !== last ? '&' : '');
				c++;
			}
			data = encodeURI(str);
		}
		if (result)
			xhr.responseType = result;
		if (range)
			xhr.setRequestHeader('Range', 'bytes=' + range.join('-'));
		if (accept)
			xhr.setRequestHeader('Accept', accept);
		xhr.onload = function() {
			if (this.status === 200 || this.status === 206) {
				if ((Object.prototype.toString.call(this.response) === '[object ArrayBuffer]' && this.response.byteLength < 100) // is not a valid ArrayBuffer
						|| (typeof this.response === 'string' && this.response.slice(0, 8) === '{"error"')) {
					self.asyncErrorHandler(reject, new String(this.response), this.statusText);
				}
				else if (Object.prototype.toString.call(this.response) === '[object Blob]' && this.response.size < 500) { // blob should only be used on large data volume that need to be async accessed
					newFileReader.call(this, this.response).then(self.asyncErrorHandler.bind(self, reject));
				}
				else {
					if (type === 'HEAD')
						resolve(this);
					else
						resolve(this.response);
				}
			}
			else {
				reject([this.statusText]);
			}
		}
		xhr.onerror = function(e) {
			console.error(e.type, this.readyState, this.status, (Object.prototype.toString.call(this.response) === "[object ArrayBuffer]" ? new Uint8Array(this.response) : this.response));
			reject([this.statusText, (Object.prototype.toString.call(this.response) === "[object ArrayBuffer]" ? new Uint8Array(this.response) : this.response)]);
		}
		xhr.onabort = function(e) {
			console.log('xhr aborted');
		}
		xhr.ontimeout = function(e) {
			console.error('xhr timeout');
		}
		xhr.send(data);
	});
}

Request.prototype.asyncErrorHandler = function(reject, response, statusText) {
	if (response.slice(0, 8) === '{"error"') {
		reject([statusText, JSON.parse(response)]);
	}
	else
		reject([statusText, response]);
}

module.exports = Request;