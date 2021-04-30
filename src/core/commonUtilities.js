/**
 * commonUtilities
 * Functions that we extracted from various contexts,
 * having in common their well known and well understood usage
 */









exports.debounce = function (f, t, self) {
	var startedTimer = null;
	t = t || 512;
	
	var exec = function(args) {
				f.call(this, args);
				clearTimeout(startedTimer);
				startedTimer = null;
			}
	
	return function(args) {
		
		if (startedTimer !== null) {
			clearTimeout(startedTimer);
			startedTimer = setTimeout(exec.bind(self, args), t);
		}
		else
			startedTimer = setTimeout(exec.bind(self, args), t);
	}
}

exports.throttle = function (f, t) {
	var lastCallTimestamp, currentCallTimestamp;
	t = t || 512;	
	
	return function(args) {
		currentCallTimestamp = performance.now();
		if (!lastCallTimestamp || (currentCallTimestamp - lastCallTimestamp) > t)
			f(args);
		lastCallTimestamp = currentCallTimestamp;
	}
}