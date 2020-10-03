RegExp.escapeLitteral = /[-\/\\^$*+?.()|[\]{}]/g;

RegExp.escape= function(s) {
    return s.replace(this.escapeLitteral, '\\$&');
};
RegExp.protect= function(s) {
	return s.replace(/\\/g, '\\\\');
};