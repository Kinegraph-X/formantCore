/**
 * commonUtilities
 * Functions that we extracted from various contexts,
 * having in common their well known and well understood usage
 */











exports.throttle = function (f, t) {
	var lastCallTimestamp, currentCallTimestamp;
	
	return function(args) {
		currentCallTimestamp = performance.now();
		if (!lastCallTimestamp || (currentCallTimestamp - lastCallTimestamp) > t)
			f(args);
		lastCallTimestamp = currentCallTimestamp;
	}
}