
Object.defineProperty(String.prototype, 'escapeRegExp', {
	enumerable : false,
	configurable : false,
	writable : false,
	value : function () {
		return this.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
	}
});


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
function padNumber(n, width, z) {
  z = String(z) || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

//https://github.com/uxitten/polyfill/blob/master/string.polyfill.js
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padStart
if (!String.prototype.padStart) {
	Object.defineProperty(String.prototype, 'padStart', {
			value : function padStart(targetLength,padString) {
					     targetLength = targetLength>>0; //floor if number or convert non-number to 0;
					     padString = String(padString || ' ');
					     if (this.length > targetLength) {
					         return String(this);
					     }
					     else {
					         targetLength = targetLength-this.length;
					         if (targetLength > padString.length) {
					             padString += padString.repeat(targetLength/padString.length); //append to original to ensure we are longer than needed
					         }
					         return padString.slice(0,targetLength) + String(this);
					     }
					 },
					enumerable : false,
					writable : false,
					configurable : false
				}
	);
}

Object.defineProperty(String.prototype, 'dromedarToHyphens', { 						// accepts camel & dromedar
	value : function() {
				return this.replace(/[A-Z]/g, function(match, offset, str) {
					return (offset > 0 ? '-' : '') + String(match).toLowerCase() 	// accept camel & dromedar
				});
			},
			enumerable : false,
			writable : false,
			configurable : false
	}
);

Object.defineProperty(String.prototype, 'hyphensToDromedar', {
	value : function() {
				return this.replace(/\-(\w)/g, function(match, p1, offset, str) {
//					return (offset > 0 ? p1.toUpperCase() : '');
					return p1.toUpperCase();
				});
			},
			enumerable : false,
			writable : false,
			configurable : false
	}
);

Object.defineProperty(String.prototype, 'capitalizeFirstChar', {
	value : function() {
		return this.slice(0, 1).toUpperCase() + this.slice(1);
	}
});

Object.defineProperty(String.prototype, 'hexEncode', {
	value : function(){
				var hex, i;
				
				var result = "";
				for (i = 0; i < this.length; i++) {
				  hex = this.charCodeAt(i).toString(16);
				  result += ("000"+hex).slice(-4) + ' ';
				}
				
				return result
			},
			enumerable : false,
			writable : false,
			configurable : false
			}
);

Object.defineProperty(String.prototype, 'indentOnXMLTags', {
	value : function(){
				var lineCounter = 0; depthCounter = -1, returnedString = '', d = 0, indentChars = '';
				for(var i = 0, l = this.length; i < l; i++) {
					d = 0, indentChars = '';
					if (this.charAt(i) === '<') {
						if (this.charAt(i + 1) !== '/')
							depthCounter++;
						
						indentChars += '\n';
						for(d; d < depthCounter; d++) {
							indentChars += '\t';
						}
						returnedString += indentChars + this.charAt(i);
						
						if (this.charAt(i + 1) === '/')
							depthCounter--;
					}
					else if (this.charAt(i) === '>') {
						if (this.charAt(i + 1) !== '<')
							indentChars += '\n';
						for(d; d < depthCounter + 1; d++) {
							indentChars += '\t';
						}
						returnedString += this.charAt(i) + indentChars;
					}
					else {
						returnedString += this.charAt(i)
					}
				}
				return returnedString;
			},
			enumerable : false,
			writable : false,
			configurable : false
			}
);

Object.defineProperty(String.prototype, 'nbsp2ws', {
	value : function(){
		return this.replace(/&nbsp;/g, ' ');
	},
	enumerable : false,
	writable : false,
	configurable : false
	}
);
Object.defineProperty(String.prototype, 'ws2nbsp', {
	value : function(){
		return this.replace(/ /g, '&nbsp;');
	},
	enumerable : false,
	writable : false,
	configurable : false
	}
);

Object.defineProperty(String.prototype, 'getNcharsAsCharArray', {
	value : function(length, offset) {
		if (offset > this.length) {
			offset = 0;
			length = this.length;
		}
		else if ((offset + length) > this.length) {
			length = this.length - offset;
		}
//			Math.max(0, this.length - offset);
		var i = 0, ret = [];
		while (i < length) {
			ret.push(this[offset + i]);
			i++;
		}
		return ret;
	}
});

Object.defineProperty(String.prototype, 'getNcharsAsCharCodesArray', {
	value : function(length, offset) {
		if (offset > this.length) {
			offset = 0;
			length = this.length;
		}
		else if ((offset + length) > this.length) {
			length = this.length - offset;
		}
//			Math.max(0, this.length - offset);
		var i = 0, ret = [];
		while (i < length) {
			ret.push(this.charCodeAt(offset + i));
			i++;
		}
		return ret;
	}
});

// Source: http://www.antiyes.com/jquery-blink-plugin
//http://www.antiyes.com/jquery-blink/jquery-blink.js
//(function($) {
// $.fn.blink = function(options) {
//     var defaults = {
//         delay: 113,
//         iterations : 3
//     };
//     var options = $.extend(defaults, options);
//
//     return this.each(function() {
//         var obj = $(this), inter, iterations = 0;
//         inter = setInterval(function() {
//             if ($(obj).css("visibility") == "visible") {
//                 $(obj).css('visibility', 'hidden');
//             }
//             else {
//                 $(obj).css('visibility', 'visible');
//             }
//             iterations++;
//             if (iterations / 2 === options.iterations)
//            	 clearInterval(inter);
//         }, options.delay);
//     });
// }
//}(jQuery)) 