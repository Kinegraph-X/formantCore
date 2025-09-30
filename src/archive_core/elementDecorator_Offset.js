/**
 * @mixin elementDecorator_Offset
 * 
 */


var TypeManager = require('src/core/TypeManager');


var elementDecorator = {
	offset: function() {

		var rect, win,
			elem = this;

		// Get document-relative position by adding viewport scroll to viewport-relative gBCR
		rect = elem.getBoundingClientRect();
		win = elem.ownerDocument.defaultView;

		return {
			top: rect.top + win.pageYOffset,
			left: rect.left + win.pageXOffset
		};
	},

	// This method will return documentElement in the following cases:
	// 1) For the element inside the iframe without offsetParent, this method will return
	//    documentElement of the parent window
	// 2) For the hidden or detached element
	// 3) For body or html element, i.e. in case of the html node - it will return itself
	//
	// but those exceptions were never presented as a real life use-cases
	// and might be considered as more preferable results.
	//
	// This logic, however, is not guaranteed and can change at any point in the future
	offsetParentGlobal: function() {
		var offsetParent = this.offsetParent;

		while ( offsetParent && offsetParent.style.position === "static" ) {
			offsetParent = offsetParent.offsetParent;
		}

		return offsetParent || documentElement;
	}
}

module.exports = elementDecorator;